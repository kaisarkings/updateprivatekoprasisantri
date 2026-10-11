import re

with open('src/pages/UserManagementPage.tsx', 'r') as f:
    content = f.read()

# I will find the handleUpdateProfile that was mistakenly added inside getRoleBadge and remove it
content = re.sub(r'const handleUpdateProfile = async \(e: React\.FormEvent\) => \{\n.*?return \(', 'return (', content, flags=re.DOTALL)

with open('src/pages/UserManagementPage.tsx', 'w') as f:
    f.write(content)
