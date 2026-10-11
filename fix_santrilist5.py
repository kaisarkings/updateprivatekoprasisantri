import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="space-y-6 pb-8">',
    '<div className="space-y-6 sm:space-y-8 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">'
)

content = content.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">'
)

content = content.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">'
)

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)
