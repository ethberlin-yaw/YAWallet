export function storeWallet({commit}, wallet) {
    commit('storeWallet', wallet)
}

export function storeExists({commit}, exists) {
    commit('storeExists', exists)
}