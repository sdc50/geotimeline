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
    deleteEventUrl = request.route_url('home')
    return {'saveCollectionUrl': saveCollectionUrl, 
            'saveEventUrl': saveEventUrl, 
            'getEventsUrl':getEventsUrl, 
            'deleteEventUrl':deleteEventUrl, 
            'logged_in': authenticated_userid(request), 
            'user': user}
    
@view_config(route_name='settings', renderer='settings.html', permission='edit')
def settings(request):
    userid = authenticated_userid(request)
    user = DBSession.query(User).filter(User.userName==userid).first()
    return {'logged_in': authenticated_userid(request), 
            'user': user}

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
        name = params['name']
        content = params['content'] 
        shape = params['shape']
        geometry = params['geometry']
        start = params['start']
        end = params['end']
        startDate = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%S.%fZ')
        if end != '':
          endDate = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%S.%fZ')
        else:
          endDate = None
          
        collection = None
        if 'collection[id]' in params:
            collectionId = params['collection[id]']
            collection = DBSession.query(Collection).get(collectionId)
        else:
            collectionName = params['collection[name]']
            color = params['collection[color]']
            collection = Collection(collectionName, color)
            user.collections.append(collection)
        
        if 'id' in params:
          event = DBSession.query(Event).get(params['id'])
          event.name = name
          event.content = content
          event.shape = shape
          event.geometry = geometry
          event.start = startDate
          event.end = endDate
          event.collection = collection
          collection.events.append(event)
          
        else:
          event = Event(name, content, shape, geometry, startDate, endDate)
          collection.events.append(event)
          user.events.append(event) #TODO - sqlalchemy? (see initializedb)
          DBSession.add(collection)
        return event
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    
@view_config(route_name='saveCollection', renderer='json', permission='edit')
def saveCollection(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        
        name = request.params['name']
        color = request.params['color'] 
        c = Collection(name, color)
        user.collections.append(c)
        DBSession.add(c)
        DBSession.flush()
        return {'id':c.id}
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
      
@view_config(route_name='deleteEvent', renderer='json', permission='edit')
def deleteEvent(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        
        id = request.matchdict['id']
        event = DBSession.query(Event).get(id)
        DBSession.delete(event)
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
    messages = ['']*5
    
    firstName = ''
    lastName = ''
    email = ''
    login = ''
    password = ''
    
    if 'signup.submitted' in request.params:
      
      valid = True
      
      firstName = request.params['first-name']
      lastName = request.params['last-name']
      email = request.params['email']
      newPassword = request.params['password']
      confirm = request.params['confirm']
      
      if firstName == '':
        valid = False
        messages.insert(0,"First name is required")
        
      if lastName == '':
        valid = False
        messages.insert(1,"Last name is required")
        
      if email == '':
        valid = False
        messages.insert(2,"Email is required")
      else:
        existing = DBSession.query(User).filter_by(userName=email).first()      
        if existing:
          valid = False
          messages.insert(3,"Account already exists for " + email)
  
      if newPassword == '' or newPassword != confirm:
        valid = False
        messages.insert(4,"Passwords don't match")
          
      if valid:
        newUser = User(firstName, lastName, email, newPassword)
        editor = DBSession.query(Group).filter_by(name='editor').first()
        newUser.groups.append(editor)
        DBSession.add(newUser)
        
        headers = remember(request, email)
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

        messages.insert(5,'Credentials did not match')

    return dict(
        messages = messages,
        url = request.application_url + '/login',
        came_from = came_from,
        firstName = firstName,
        lastName = lastName,
        email = email,
        login = login,
        password = password,
        )

@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location = request.route_url('home'),
                     headers = headers)