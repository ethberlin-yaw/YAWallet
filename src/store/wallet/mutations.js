import { strict } from "assert";


export function storeWallet (state, wallet) {
    state.wallet = wallet
}

export function storeExists(state, exists) {
    state.exists = exists
}

export function ethBalance(state, ethBalance) {
    state.ethBalance = ethBalance
}

export function ethusd(state, price) {
    state.ethusd = price
}