from pyramid.config import Configurator

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from .security import groupfinder

from sqlalchemy import engine_from_config

from .models import (
    DBSession,
    Base,
    )

from .views import json_renderer


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    authn_policy = AuthTktAuthenticationPolicy(
        'sosecret', callback=groupfinder, hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()
    config = Configurator(settings=settings,
                          root_factory='geotimeline:models.RootFactory')
    config.set_authentication_policy(authn_policy)
    config.set_authorization_policy(authz_policy)
    #config.include('pyramid_chameleon')
    config.include('pyramid_jinja2')
    #config.add_jinja2_extension('html')
    config.add_renderer('.html', 'pyramid_jinja2.renderer_factory')
    config.add_renderer('json', json_renderer)
    config.add_jinja2_search_path('geotimeline:templates')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('map', '/timemap')
    config.add_route('events', '/getEvents')
    config.add_route('friends-events', '/getFriendsEvents')
    config.scan()
    return config.make_wsgi_app()
