<template>
<q-page class="flex flex-center">
    <div class="column text-center" v-if="exists">
        <div v-if="address != ''">
            <div>
                <img width="150" height="150" :src="qrCode.dataURL" />

                <q-chip class="avatar-chip">
                    <q-avatar size="2em" color="red" text-color="white">
                        <img :src="blockies.create({seed: address})" />
                    </q-avatar>
                    {{address}}

                </q-chip>
                <q-banner class="text-white bg-red q-my-lg">
                    Your balance is below the minimum required balance. Send 5 DAI to this wallet in order to begin.

                    <q-btn class="q-my-lg" outline color="white" label="Deposit DAI" />
                </q-banner>
                <q-banner class="text-white bg-blue q-my-lg">
                    You currently have {{gasusd(ethBalance, ethusd).toFixed(2)}} USD in network fees.
                </q-banner>
            </div>

            <div>
                <q-list bordered class="q-my-sm">

                    <q-item clickable v-ripple>
                        <q-item-section avatar>
                            <q-avatar>
                                <img src="/assets/dai.svg">
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>DAI</q-item-section>
                        <q-item-section>5</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                        <q-item-section avatar>
                            <q-avatar>
                                <img src="/assets/usdc.png">
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>USDC</q-item-section>
                        <q-item-section>10</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                        <q-item-section avatar>
                            <q-avatar>
                                <img src="/assets/lpt.png">
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>LPT</q-item-section>
                        <q-item-section>55.39</q-item-section>
                    </q-item>

                </q-list>
            </div>
            <div class="fixed-bottom">
                <a @click="revealSeed = true" href="#" class="seed-reveal text-overline">reveal seed phrase</a>
            </div>
        </div>
        <div v-else>
            <h6>Unlock your wallet</h6>
            <q-input v-model="password" type="password" placeholder="enter password..." class="q-my-md" :disabled="unlocking" />
            <q-btn color="primary" size="xl" @click="unlockWallet" label="Unlock Wallet" v-if="unlocking === false" />
            <div class="flex items-center" v-else>
                <q-spinner color="primary" :thickness="2" size="3em" /> Unlocking wallet ...
            </div>
        </div>

    </div>
    <div class="column" v-else>
        <h6>No wallet found. Create a new wallet</h6>
        <q-input v-model="password" type="password" placeholder="enter password..." class="q-my-md" />
        <q-btn size="xl" @click="createWallet" color="primary" label="Create New Wallet" v-if="creating === false" />
        <div class="flex items-center" v-else>
            <q-spinner color="primary" :thickness="2" size="3em" /> Creating wallet ...
        </div>
    </div>

    <q-dialog v-model="revealSeed">
        <q-card class="q-px-lg q-py-lg">
            <q-card-section class="row justify-between q-mb-lg">
                <div class="text-h6">Seed Phrase</div>
                <q-space />
                <q-btn class="" icon="close" flat round dense @click="revealSeed = false" />
            </q-card-section>

            <q-card-section>
                {{seed}}
            </q-card-section>
        </q-card>
    </q-dialog>
</q-page>
</template>

<script>
import {
    mapState
} from 'vuex'
import Wallet from '../util/wallet'
import blockies from '../util/blockies'
import axios from 'axios'
import {
    gasusd
} from '../util/gas'
import EthereumQRPlugin from 'ethereum-qr-code'

export default {
    name: 'PageIndex',
    data() {
        return {
            password: '',
            creating: false,
            unlocking: false,
            blockies: blockies,
            gasusd: gasusd,
            revealSeed: false,
            qrCode: ''
        }
    },
    computed: mapState({
        exists: state => state.wallet.exists,
        address: state => state.wallet.wallet ? state.wallet.wallet.wallet.address : '',
        seed: state => state.wallet.wallet ? state.wallet.wallet.wallet.mnemonic : '',
        ethBalance: state => state.wallet.wallet ? state.wallet.ethBalance : '0.00',
        ethusd: state => state.wallet.ethusd
    }),
    methods: {
        createWallet: async function () {
            if (this.password.length < 2) {
                this.$q.notify({
                    timeout: 5000,
                    color: 'red',
                    textColor: 'white',
                    message: "Enter a decent password !",
                    actions: [{
                        icon: 'close',
                        color: 'white'
                    }]
                })
                return
            }
            try {
                this.creating = true
                let wallet = await Wallet.create(this.password)
                this.$store.dispatch('wallet/storeWallet', wallet)
                let exists = await Wallet.exists()
                this.$store.dispatch('wallet/storeExists', exists)
                const qr = new EthereumQRPlugin()
                this.qrCode = await qr.toDataUrl({
                    to: wallet.wallet.address
                })
            } catch (e) {
                this.$q.notify({
                    timeout: 5000,
                    color: 'red',
                    textColor: 'white',
                    message: e.message,
                    actions: [{
                        icon: 'close',
                        color: 'white'
                    }]
                })
            }
            this.creating = false
        },
        unlockWallet: async function () {
            try {
                this.unlocking = true
                let wallet = await Wallet.getWallet(this.password)
                this.$store.dispatch('wallet/storeWallet', wallet)
                let ethBalance = await wallet.ethBalance()
                this.$store.dispatch('wallet/ethBalance', ethBalance)
                const qr = new EthereumQRPlugin()
                this.qrCode = await qr.toDataUrl({
                    to: wallet.wallet.address
                })
                console.log(await wallet.cdaiBalance())
                console.log(await wallet.daiBalance())
            } catch (e) {
                this.$q.notify({
                    timeout: 5000,
                    color: 'red',
                    textColor: 'white',
                    message: e.message,
                    actions: [{
                        icon: 'close',
                        color: 'white'
                    }]
                })
            }
            this.unlocking = false
        }
    },
    async created() {
        let exists = await Wallet.exists()
        this.$store.dispatch('wallet/storeExists', exists)
        setInterval(() => {
            this.$store.dispatch('wallet/ethusd')
        }, 5000)
    }
}
</script>

<style>
.seed-reveal {
    transition: color 1s;
    text-decoration: none;
}

.seed-reveal:hover {
    color: #008080
}

.avatar-chip {
    font-size: 1em;
    height: 2em;
}
</style>
