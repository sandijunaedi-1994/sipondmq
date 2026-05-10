/**
 * Menggabungkan permissions bawaan user dengan permissions dari grup-grup yang diikutinya
 * @param {Array} userPermissions - Permissions spesifik user
 * @param {Array} adminGroups - Array of AdminGroup objects yang memiliki properti permissions
 * @returns {Array} - Merged array of unique permissions
 */
const mergePermissions = (userPermissions = [], adminGroups = []) => {
  let merged = [...(userPermissions || [])];
  
  if (adminGroups && adminGroups.length > 0) {
    adminGroups.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        merged = [...merged, ...group.permissions];
      }
    });
  }
  
  // Hapus duplikasi
  return [...new Set(merged)];
};

module.exports = { mergePermissions };
