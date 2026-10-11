import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

# Fix table header
content = content.replace(
    '<th className="py-3 px-4 text-center">Aksi Cepat</th>',
    '''{user?.role !== 'viewer' && user?.role !== 'guest' && (
                    <th className="py-4 px-5 text-center">Aksi Cepat</th>
                  )}'''
)

content = content.replace(
    'className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"',
    'className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider"'
)

# Fix table padding
content = content.replace('py-3 px-4', 'py-4 px-5')

# Hide actions for viewers
content = content.replace(
    '''                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1">''',
    '''                      {user?.role !== 'viewer' && user?.role !== 'guest' && (
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">'''
)
content = content.replace(
    '''                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => {''',
    '''                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => {'''
)

# close the td block
content = content.replace(
    '''                          )}
                        </div>
                      </td>
                    </tr>''',
    '''                          )}
                        </div>
                      </td>
                      )}
                    </tr>'''
)

# Also fix the Aksi Cepat Buttons size
content = content.replace('p-1.5 rounded-lg', 'p-2 rounded-xl')

# Fix Card spacing and size
content = content.replace(
    'p-5 space-y-3',
    'p-6 space-y-4'
)

# Replace the card bottom action area condition to exclude viewer
content = content.replace(
    "{user?.role !== 'guest' && (",
    "{user?.role !== 'viewer' && user?.role !== 'guest' && ("
)

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)
