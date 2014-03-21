from sqlalchemy.exc import DBAPIError

from .models import (
    DBSession,
    User,
    )


USERS = {'editor':'editor',
         'viewer':'viewer',
         'test@test.com'  :'test'}
GROUPS = {'editor':['group:editors'],
          'test@test.com':['group:editors']}

def groupfinder(userid, request):
    user = DBSession.query(User).filter_by(userName=userid).first()
    if user:
        return GROUPS.get(userid, [])