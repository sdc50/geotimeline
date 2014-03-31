from pyramid.response import Response
from pyramid.view import (
    view_config,
    forbidden_view_config,
    )

from pyramid.httpexceptions import (
    HTTPFound,
    HTTPNotFound,
    )

from pyramid.security import (
    remember,
    forget,
    authenticated_userid,
    )

from sqlalchemy.exc import DBAPIError
import transaction

from .models import (
    DBSession,
    User,
    Group,
    Event,
    Collection,
    Tag,
    )

from pyramid.renderers import JSON

import datetime


json_renderer = JSON()
def datetime_adapter(obj, request):
    return obj.isoformat()
json_renderer.add_adapter(datetime.datetime, datetime_adapter)

@view_config(route_name='home', renderer='index.html', permission='view')
def home(request):
    userid = authenticated_userid(request)
    user = DBSession.query(User).filter(User.userName==userid).first()
    return dict(logged_in = authenticated_userid(request), user = user)

@view_config(route_name='map', renderer='timemap.html', permission='edit')
def geotimeline(request):
    userid = authenticated_userid(request)
    user = DBSession.query(User).filter(User.userName==userid).first()
    saveCollectionUrl = request.route_url('saveCollection')
    saveEventUrl = request.route_url('saveEvent')
    getEventsUrl = request.route_url('events')
    return {'saveCollectionUrl': saveCollectionUrl, 'saveEventUrl': saveEventUrl, 'getEventsUrl':getEventsUrl, 'logged_in': authenticated_userid(request), 'user': user}

@view_config(route_name='events', renderer='json', permission='edit')
def getUserEvents(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        collections = user.collections
        events = user.events
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    return {'collections': collections, 'events': events}
  
@view_config(route_name='saveEvent', renderer='json', permission='edit')
def saveEvent(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        
        params = request.POST
        print(params)
        name = params['name']
        content = params['content'] 
        shape = params['shape']
        geometry = params['geometry']
        start = params['start'] 
        end = params['end']
        startDate = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%S.%fZ')
        endDate = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%S.%fZ')
        if 'collection[id]' in params:
            collectionId = params['collection[id]']
            c = DBSession.query(Collection).filter(Collection.id==collectionId).first()
        else:
            collectionName = params['collection[name]']
            color = params['collection[color]']
            c = Collection(collectionName, color)
            user.collections.append(c)
        
        event = Event(name, content, shape, geometry, startDate, endDate)
        c.events.append(event)
        user.events.append(event) #TODO - sqlalchemy? (see initializedb)
        DBSession.add(c)
        return event
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    
@view_config(route_name='saveCollection', renderer='json', permission='edit')
def saveCollection(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        
        print(request.params)
        name = request.params['name']
        color = request.params['color'] 
        c = Collection(name, color)
        user.collections.append(c)
        DBSession.add(c)
        DBSession.flush()
        return {'id':c.id}
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
 
conn_err_msg = """\
Pyramid is having a problem using your SQL database.  The problem
might be caused by one of the following things:

1.  You may need to run the "initialize_GeoTimeline_db" script
    to initialize your database tables.  Check your virtual 
    environment's "bin" directory for this script and try to run it.

2.  Your database server may not be running.  Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.

After you fix the problem, please restart the Pyramid application to
try it again.
"""

@view_config(route_name='login', renderer='login.jinja2')
@forbidden_view_config(renderer='login.jinja2')
def login(request):
    login_url = request.route_url('login')
    referrer = request.url
    if referrer == login_url:
        referrer = '/' # never use the login form itself as came_from
    came_from = request.params.get('came_from', referrer)
    messages = ['','']
    login = ''
    password = ''
    if 'signup.submitted' in request.params:
      print(request.params)
      
      firstName = request.params['first-name']
      lastName = request.params['last-name']
      login = request.params['email']
      password = request.params['password']
      
      if login == '':
        messages[0] = "Invalid email"
      else:
        existing = DBSession.query(User).filter_by(userName=login).first()
        
        if existing:
          messages[0] = "Account already exists for " + login
        else:
          newUser = User(firstName, lastName, login, password)
          editor = DBSession.query(Group).filter_by(name='editor').first()
          newUser.groups.append(editor)
          DBSession.add(newUser)
          
          headers = remember(request, login)
          return HTTPFound(location = came_from,
                           headers = headers)
          
    elif 'login.submitted' in request.params:
        login = request.params['login']
        password = request.params['password']
        user = DBSession.query(User).filter_by(userName=login).first()
        
        if user and user.password == password:
            headers = remember(request, login)
            return HTTPFound(location = came_from,
                             headers = headers)

        messages[1] = 'Failed login'

    return dict(
        messages = messages,
        url = request.application_url + '/login',
        came_from = came_from,
        login = login,
        password = password,
        )

@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location = request.route_url('home'),
                     headers = headers)