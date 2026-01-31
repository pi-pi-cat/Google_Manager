"""
应用启动入口
"""
import os

# 确保 instance 目录存在且具有适当的权限 BEFORE app init
# 使用 mode=0o777 以获得完全权限，exist_ok=True 以防止目录已存在时出错
os.makedirs('instance', mode=0o777, exist_ok=True)

from app import create_app

app = create_app()

if __name__ == '__main__':
    print('=' * 50)
    print('谷歌账号管理系统启动中...')
    print('访问地址: http://localhost:8002')
    print('=' * 50)
    app.run(host='0.0.0.0', port=8002, debug=True)
