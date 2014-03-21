from pyramid.security import (
    Allow,
    Everyone,
    )

from sqlalchemy import (
    Table,
    Column,
    Index,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    )
 
from sqlalchemy.orm import (
    relationship,
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

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    userName = Column('user_name', Text, unique=True)
    firstName = Column('first_name', Text)
    lastName = Column('last_name', Text)
    password = Column(Text)
    collections = relationship('Collection', back_populates='user')
    events = relationship('Event', back_populates='user')
    groups = relationship('Group', secondary='group_association', back_populates='users')
    
    def __init__(self,email, firstName, lastName, password):
        self.userName = email
        self.firstName = firstName
        self.lastName = lastName
        self.password = password
        
        
    def __repr__(self):
        return "<'%s''%s'>" % (self.__class__.__name__, self.__json__(None))
        
    def __json__(self,request):
        return {'email':self.userName, 
                'first':self.firstName, 
                'last':self.lastName
                }
    

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)
    users = relationship('User', secondary='group_association', back_populates='groups')
    

association_table = Table('group_association', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)
    

class Event(Base):
    __tablename__ = 'events'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    content = Column(Text)
    shape = Column(Text)
    geometry = Column(Text)
    start = Column(DateTime)
    end = Column(DateTime)
    collectionId = Column('collection_id', Integer, ForeignKey('collections.id'))
    collection = relationship('Collection', back_populates='events')
    userId = Column('user_id', Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='events')
    tags = relationship('Tag', secondary='association', back_populates='events')
    
    
    def __init__(self,name, content, shape, geometry, start, end=None):
        self.name = name
        self.content = content
        self.shape = shape
        self.geometry = geometry
        self.start = start
        self.end = end
        
    def __repr__(self):
        return "<'%s''%s'>" % (self.__class__.__name__, self.__json__(None))
    
    def __json__(self,request):
        return {'name':self.name, 
                'content':self.content, 
                'shape':self.shape,
                'geometry':self.geometry,
                'start':self.start,
                'end':self.end,
                'id':self.id,
                'collection':self.collection}
    
    
class Collection(Base):
    __tablename__ = 'collections'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    color = Column(Text)
    userId = Column('user_id', Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='collections')
    events = relationship('Event', back_populates='collection')
    
    def __init__(self, name, color):
        self.name = name
        self.color = color
        
    def __repr__(self):
        return "<'%s''%s'>" % (self.__class__.__name__, self.__json__(None))
        
    def __json__(self,request):
        return {'name':self.name,
                'id':self.id, 
                'color':self.color, 
                'user':self.user}
                #'events':self.events}
    
class Tag(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    events = relationship('Event', secondary='association', back_populates='tags')
     
association_table = Table('association', Base.metadata,
    Column('event_id', Integer, ForeignKey('events.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)



#Index('my_index', MyModel.name, unique=True, mysql_length=255)
