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
        testUser = User('test','Mr.','Test', 'test', 'test@example.com')
        collection = Collection('My Test Vacation', 'test-vacation')
        startTime = datetime(2014, 1, 21, 16, 30)
        endTime = datetime(2014, 1, 22, 6, 30)
        event = Event(name='Travel', content='I test traveled to the test location.', shape='polyline', geometry='encodedstring', start=startTime, end=endTime)
        collection.events.append(event)
        testUser.collections.append(collection)
        DBSession.add(testUser)
