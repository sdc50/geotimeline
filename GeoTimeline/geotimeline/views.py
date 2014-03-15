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

from .security import USERS

from sqlalchemy.exc import DBAPIError

from .models import (
    DBSession,
    User,
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
  return dict(logged_in = authenticated_userid(request))

@view_config(route_name='map', renderer='timemap.html', permission='edit')
def geotimeline(request):
    saveEventUrl = request.route_url('save')
    getCollectionsUrl = request.route_url('collections')
    return {'saveEventUrl': saveEventUrl, 'getCollectionsUrl':getCollectionsUrl, 'logged_in': authenticated_userid(request)}

@view_config(route_name='collections', renderer='json', permission='edit')
def getUserCollections(request):
    try:
        userid = authenticated_userid(request)
        user = DBSession.query(User).filter(User.userName==userid).first()
        collections = user.collections
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    return {'collections': collections}
  
@view_config(route_name='save', renderer='json', permission='edit')
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
        endDate = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%S.%fZ')
        collectionId = params['collectionId']
        #print('****************************', start, startDate)
        if collectionId:
            c = DBSession.query(Collection).filter(Collection.id==collectionId).first()
        else:
            collection = params['collection']
            color = params['color']
            c = Collection(collection, color)
            user.collections.append(c)
        
        event = Event(name, content, shape, geometry, startDate, endDate)
        c.events.append(event)
        DBSession.add(c)
        return {'msg':'success'}
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    return {'collections': collections}
    
  
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
    message = ''
    login = ''
    password = ''
    if 'form.submitted' in request.params:
        login = request.params['login']
        password = request.params['password']
        user = DBSession.query(User).filter_by(userName=login).first()
        #if USERS.get(login) == password:
        if user and user.password == password:
            headers = remember(request, login)
            return HTTPFound(location = came_from,
                             headers = headers)
        message = 'Failed login'

    return dict(
        message = message,
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