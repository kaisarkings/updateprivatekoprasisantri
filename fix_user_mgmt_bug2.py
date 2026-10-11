import re

with open('src/pages/UserManagementPage.tsx', 'r') as f:
    content = f.read()

# Add handleUpdateProfile right before `return (` inside the main UserManagementPage component.
# The main return is right after the `getRoleBadge` definition.
# Let's locate the end of getRoleBadge:
#     }
#   };
# 
#   return (

content = content.replace(
    '    }\n  };\n\n  return (',
    '''    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ email: profileEmail, password: profilePassword || undefined });
      showToast('success', 'Profil Diperbarui', 'Email / Password berhasil diubah.');
      setIsProfileModalOpen(false);
    } catch(err: any) {
      showToast('error', 'Gagal Memperbarui Profil', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return ('''
)

with open('src/pages/UserManagementPage.tsx', 'w') as f:
    f.write(content)
