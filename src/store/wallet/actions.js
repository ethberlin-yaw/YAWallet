import axios from 'axios'
export function storeWallet({commit}, wallet) {
    commit('storeWallet', wallet)
}

export function storeExists({commit}, exists) {
    commit('storeExists', exists)
}

export function ethBalance({commit}, ethBalance) {
    commit('ethBalance', ethBalance)
}

export async function ethusd({commit}) {
    let price = await axios.get('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=AYVQKI2AW5TZCHII5KIVB5N6QQIY1MM1Y9')
    commit('ethusd', price.data.result.ethusd)
}

export async function polleth({commit}, wallet) {
    commit('ethBalance', await wallet.ethBalance())
} 	