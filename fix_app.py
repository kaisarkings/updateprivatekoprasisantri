import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">',
    '<main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full overflow-y-auto relative">'
)

content = content.replace(
    '<div key={location.pathname} className="w-full page-transition">',
    '<div key={location.pathname} className="w-full page-transition h-full flex flex-col">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

