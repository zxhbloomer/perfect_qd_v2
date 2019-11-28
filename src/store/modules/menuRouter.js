
const state = {
  menuRouter: null
}

const mutations = {
  SET_MENU_ROUTER: (state, setMenuRouter) => {
    state.setMenuRouter = setMenuRouter
  }
}

const actions = {
  setMenuRouter({ commit }, data) {
    commit('SET_MENU_ROUTER', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
