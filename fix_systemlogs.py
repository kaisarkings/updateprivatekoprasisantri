import re

with open('src/pages/RiwayatPage.tsx', 'r') as f:
    content = f.read()

# Let's see how SystemLogsView is defined
# const SystemLogsView: React.FC = () => {
content = re.sub(
    r'const SystemLogsView: React\.FC = \(\) => \{',
    r'const SystemLogsView: React.FC<{ uiStyle: string }> = ({ uiStyle }) => {',
    content
)

content = re.sub(
    r'<SystemLogsView />',
    r'<SystemLogsView uiStyle={uiStyle} />',
    content
)

content = re.sub(
    r'<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">',
    r'<div className={getCardPaddingClass(uiStyle, "p-0 overflow-hidden")}>',
    content
)

# Also let's highlight 'TopUp', 'Delete Santri', 'Transaction' (Transaksi Jajan) inside the details/action.

with open('src/pages/RiwayatPage.tsx', 'w') as f:
    f.write(content)

