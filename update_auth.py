import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "role: 'guest',",
    "role: 'viewer',"
)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

with open('src/pages/LoginPage.tsx', 'r') as f:
    content2 = f.read()
    
content2 = content2.replace(
    'Masuk Sebagai Wali Santri',
    'Masuk User Biasa (Wali Santri)'
)

with open('src/pages/LoginPage.tsx', 'w') as f:
    f.write(content2)
