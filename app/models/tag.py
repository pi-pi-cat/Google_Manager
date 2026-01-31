"""
Tag 模型 - 存储所有唯一的 tag
"""
from datetime import datetime
from app import db


class Tag(db.Model):
    """
    Tag 表 - 存储所有唯一的标签
    
    Attributes:
        id: 主键ID
        name: 标签名称（不区分大小写唯一）
        created_at: 创建时间
    """
    __tablename__ = 'tag'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联到 AccountTag（方便查询）
    account_associations = db.relationship('AccountTag', back_populates='tag', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else ''
        }
    
    def __repr__(self):
        return f'<Tag {self.name}>'
