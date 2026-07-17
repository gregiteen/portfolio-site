(function () {
  'use strict';

  var KEY = 'gi_cna_state_v1';

  function emptyState() {
    return { history: [], assessment: null, intake: null, requestId: null, proposal: null, updatedAt: null };
  }

  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      history: Array.isArray(state.history) ? state.history.filter(function (message) {
        return message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string';
      }).slice(-60) : [],
      assessment: state.assessment && typeof state.assessment === 'object' ? state.assessment : null,
      intake: state.intake && typeof state.intake === 'object' ? state.intake : null,
      requestId: typeof state.requestId === 'string' ? state.requestId : null,
      proposal: state.proposal && typeof state.proposal === 'object' ? state.proposal : null,
      updatedAt: typeof state.updatedAt === 'string' ? state.updatedAt : null
    };
  }

  function load() {
    try {
      return normalize(JSON.parse(localStorage.getItem(KEY) || 'null'));
    } catch (error) {
      return emptyState();
    }
  }

  function save(patch) {
    var next = normalize(Object.assign({}, load(), patch || {}, { updatedAt: new Date().toISOString() }));
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function requestId() {
    var current = load();
    if (current.requestId) return current.requestId;
    var value = window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
    save({ requestId: value });
    return value;
  }

  function mergeRemote(remote) {
    var local = load();
    var incoming = normalize(remote);
    var localTime = Date.parse(local.updatedAt || '') || 0;
    var remoteTime = Date.parse(incoming.updatedAt || '') || 0;
    var preferred = remoteTime > localTime ? incoming : local;
    var other = preferred === incoming ? local : incoming;
    return save({
      history: preferred.history.length >= other.history.length ? preferred.history : other.history,
      assessment: preferred.assessment || other.assessment,
      intake: preferred.intake || other.intake,
      requestId: preferred.requestId || other.requestId,
      proposal: preferred.proposal || other.proposal
    });
  }

  async function hydrate() {
    try {
      var response = await fetch('/api/cna-state', { headers: { Accept: 'application/json' } });
      if (!response.ok) return load();
      var data = await response.json();
      return data.state ? mergeRemote(data.state) : load();
    } catch (error) {
      return load();
    }
  }

  window.GICna = { load: load, save: save, requestId: requestId, hydrate: hydrate };
})();
