from pyramid.security import (
    Allow,
    Everyone,
    )

from sqlalchemy import (
    Column,
    Index,
    Integer,
    Text,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    )

from zope.sqlalchemy import ZopeTransactionExtension

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()


class RootFactory(object):
    __acl__ = [ (Allow, Everyone, 'view'),
                (Allow, 'group:editors', 'edit') ]
    def __init__(self, request):
        pass

class Event(Base):
    __tablename__ = 'event'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    value = Column(Integer)


#Index('my_index', MyModel.name, unique=True, mysql_length=255)
