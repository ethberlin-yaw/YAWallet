export function gasusd(ethbalance, ethusd) {
    ethusd = parseFloat(ethusd)
    ethbalance = parseFloat(ethbalance)
    return ethbalance * ethusd
}