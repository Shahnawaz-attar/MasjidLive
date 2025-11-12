export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatarUrl(name: string): string {
  const initials = getInitials(name);
  const colors = [
    'FF6B6B', // Red
    '4ECDC4', // Teal
    '45B7D1', // Blue
    'F7B731', // Gold
    '5F27CD', // Purple
    '00D2D3', // Cyan
    'FF9FF3', // Pink
    '54A0FF', // Light Blue
    '48DBFB', // Sky Blue
    '1DD1A1', // Green
  ];

  const hash = name.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&bold=true&size=150`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than 5MB. Current: ${formatFileSize(file.size)}` };
  }

  return { valid: true };
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
