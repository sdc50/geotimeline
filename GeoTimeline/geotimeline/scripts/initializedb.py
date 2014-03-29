import os
import sys
import transaction
from datetime import datetime

from sqlalchemy import engine_from_config

from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from pyramid.scripts.common import parse_vars

from ..models import (
    DBSession,
    Base,
    User,
    Group,
    Event,
    Collection,
    Tag,
    )

def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> [var=value]\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) < 2:
        usage(argv)
    config_uri = argv[1]
    options = parse_vars(argv[2:])
    setup_logging(config_uri)
    settings = get_appsettings(config_uri, options=options)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.create_all(engine)
    with transaction.manager:
        editor = Group('editor');
        testUser = User('Mr.','Test', 'test@test.com', 'test')
        testUser.groups.append(editor)
        collection = Collection('My Test Vacation', '#008000')
        startTime = datetime(2014, 3, 15, 16, 30)
        endTime = datetime(2014, 3, 16, 6, 30)
        event = Event(name='Travel', content='I test traveled to the test location.', shape='polygon', geometry='vvyfEmmsr[vjgBq{aCq_oAspd@', start=startTime, end=endTime)
        

        event2 = Event(name = 'Marker1',
                       content = 'Marker1 content',
                       shape = 'marker',
                       geometry = 'd_ehE}`}l[',
                       start = startTime,
                       end = endTime)
#var mockOverlayData = [{
#  name: 'marker1',
#  content: 'content content',
#  collection: {name:'first collection', color: '#008000'},//green
#  user: 'user1',
#  shape: 'marker',
#  geometry: 'd_ehE}`}l[',
#  start: '2014-03-18 14:59:23',
#  end: '2014-05-18 15:00:00'
#},
#{
#  name: 'marker2',
#  content: 'content content',
#  collection: {name:'second collection', color: '#003D80'},
#  user: 'user1',
#  shape: 'marker',
#  geometry: '`i`jEac|~[',
#  start: '2014-01-18 15:47:12',
#  end: '2014-03-18 15:50:12'
#},
#{
#  name: 'marker3',
#  content: 'content content',
#  collection: {name:'third collection', color: '#DF1D03'},
#  user: 'user1',
#  shape: 'marker',
#  geometry: 'zf~lEgmqm[',
#  start: '2014-03-18 16:00:00',
#  end: '2014-03-20 16:00:00'
#},
#//polygons
#{
#  name: 'polygon1',
#  content: 'content content',
#  collection: {name:'first collection', color: '#008000'},//green
#  user: 'user1',
#  shape: 'polygon',
#  geometry: 'vvyfEmmsr[vjgBq{aCq_oAspd@',
#  start: '2014-02-18 14:59:23',
#  end: '2014-04-18 15:00:00'
#},
#{
#  name: 'polygon2',
#  content: 'content content',
#  collection: {name:'second collection', color: '#003D80'},
#  user: 'user1',
#  shape: 'polygon',
#  geometry: 'hxjoE_cck[qpR{`sCbt`AtfQh[zsoB',
#  start: '2014-03-18 15:47:12',
#  end: '2014-04-18 15:50:12'
#},
#{
#  name: 'polygon3',
#  content: 'content content',
#  collection: {name:'third collection', color: '#DF1D03'},
#  user: 'user1',
#  shape: 'polygon',
#  geometry: 'rewmEiwmv[{vY}~eBje^ikS|fe@tfQf{G||x@',
#  start: '2014-04-18 15:51:59',
#  end: null//'2014-05-18 16:00:00'
#},
#//polylines
#{
#  name: 'polyline1',
#  content: 'content content',
#  collection: {name:'first collection', color: '#008000'},//green
#  user: 'user1',
#  shape: 'polyline',
#  geometry: '|s{oEysgr[sieB}}[vqkAig`@of_BgimA_}Gi|i@',
#  start: '2014-05-18 14:59:23',
#  end: '2014-06-18 15:00:00'
#},
#{
#  name: 'polyline2',
#  content: 'content content',
#  collection: {name:'second collection', color: '#003D80'},
#  user: 'user1',
#  shape: 'polyline',
#  geometry: 'zelkEenk{[vioAsia@okwA}xeArwb@irV',
#  start: '2014-05-18 15:47:12',
#  end: '2014-06-18 15:50:12'
#},
#{
#  name: 'polyline3',
#  content: 'content content',
#  collection: {name:'third collection', color: '#DF1D03'},
#  user: 'user1',
#  shape: 'polyline',
#  geometry: '`choEaou}[dijAtcjGmlCzv_C',
#  start: '2014-05-18 15:51:59',
#  end: '2014-05-30 16:00:00'
#},
#];
        
        
        collection.events.append(event)
        collection.events.append(event2)
        testUser.collections.append(collection)
        testUser.events.append(event) #TODO sqlalchemy should take care of this.  I need to figure out how to keep it in sync.
        testUser.events.append(event2)
        DBSession.add(testUser)
