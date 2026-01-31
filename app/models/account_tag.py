"""
AccountTag 关联表模型 - Account 和 Tag 的 many-to-many 关系
"""
from datetime import datetime
from app import db


class AccountTag(db.Model):
    """
    AccountTag 关联表 - 账号与标签的多对多关系
    
    Attributes:
        account_id: 账号ID（外键）
        tag_id: 标签ID（外键）
        created_at: 关联创建时间
    """
    __tablename__ = 'account_tag'
    
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id', ondelete='CASCADE'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联到 Account 和 Tag
    account = db.relationship('Account', back_populates='tag_associations')
    tag = db.relationship('Tag', back_populates='account_associations')
    
    def __repr__(self):
        return f'<AccountTag account_id={self.account_id} tag_id={self.tag_id}>'
