// store/changeStore.memory.js

let version = 0;
const changes = [];

module.exports = {
  add(payload) {
    version++;
    changes.push({ version, payload });

    if (changes.length > 500) changes.shift();

    return version;
  },

  since(since) {
    return changes.filter(c => c.version > since);
  },

  currentVersion() {
    return version;
  },

  oldestVersion() {
    return changes[0]?.version || version;
  }
};
