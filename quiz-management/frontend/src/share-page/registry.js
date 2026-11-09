const pageModules = import.meta.glob('./*.jsx', { eager: true });

function pageIdFromPath(path) {
  return path
    .slice('./'.length, -'.jsx'.length)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function pageTitleFromId(pageId) {
  return pageId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export const sharedPages = Object.entries(pageModules).map(([path, pageModule]) => {
  const id = pageIdFromPath(path);
  if (!id || typeof pageModule.default !== 'function') {
    throw new Error(`Shared page "${path}" must export a default React component`);
  }
  return {
    id,
    title: pageModule.pageTitle || pageTitleFromId(id),
    description: pageModule.pageDescription || '',
    Component: pageModule.default,
  };
});

const ids = sharedPages.map((page) => page.id);
if (new Set(ids).size !== ids.length) {
  throw new Error('Shared page filenames must produce unique page IDs');
}
