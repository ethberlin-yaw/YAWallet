<template>
<q-page class="flex justify-center">
    <div class="column text-center" v-if="exists">
        <div v-if="address != ''">
            <div>
                <div class="text-center">
                    <div>
                        <img width="150" height="150" :src="qrCode.dataURL" />
                    </div>

                    <q-chip class="avatar-chip">
                        <q-avatar size="2em" color="red" text-color="white">
                            <img :src="blockies.create({seed: address})" />
                        </q-avatar>
                        {{address}}

                    </q-chip>
                </div>
                <q-banner v-if="parseFloat(daiBalance)<5 && parseFloat(cdaiBalance) == 0" class="text-white bg-red q-my-lg">
                    Your balance is below the minimum required balance. Send some DAI to this wallet in order to begin.
                    Or get some DAI from the faucet (testnet only)
                    <q-btn v-if="this.mintingDAI===false" @click="getDAI" class="q-my-md" outline color="white" label="Get DAI from faucet" />
                    <div v-else class="row items-center justify-center">
                        <q-spinner color="white"></q-spinner>
                        &nbsp; Getting some DAI...
                    </div>
                </q-banner>
                <q-banner v-else-if="parseFloat(daiBalance)>5 && parseFloat(cdaiBalance)==0" class="text-white bg-green q-my-lg">
                    You've got some DAI ! now Compound it and earn interest to pay for your transactions.
                    <q-btn v-if="compounding === false" @click="compoundDai" color="white" outline label="COMPOUND MY DAI" />
                    <div v-else class="row items-center justify-center">
                        <q-spinner color="white" :thickness="2" /> &nbsp; Compounding !</div>
                </q-banner>
                <q-banner class="text-white bg-blue q-my-lg">
                    You currently have <b>&#36; {{totalAvailable.toFixed(6)}} </b> in network fees.<br />
                    <span class="q-caption">You have <b>&cent; {{this.intrestEarned}}</b> in spendable intrest </span>
                </q-banner>
            </div>

            <div>
                <q-list bordered class="q-my-sm q-mb-xl absolute-bottom q-mx-sm">

                    <q-scroll-area class="viewh">
                        <q-item clickable v-ripple>
                            <q-item-section avatar>
                                <q-avatar>
                                    <img src="/assets/dai.svg">
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>DAI</q-item-section>
                            <q-item-section>{{parseFloat(daiBalance).toFixed(2)}}</q-item-section>
                            <q-btn label="Send" color="primary" @click="DAIcard = true" />

                        </q-item>
                        <q-item clickable v-ripple>
                            <q-item-section avatar>
                                <q-avatar>
                                    <img src="/assets/usdc.png">
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>USDC</q-item-section>
                            <q-item-section>10</q-item-section>
                            <q-btn label="Send" color="primary" @click="DAIcard = true" />

                        </q-item>
                        <q-item clickable v-ripple>
                            <q-item-section avatar>
                                <q-avatar>
                                    <img src="/assets/lpt.png">
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>LPT</q-item-section>
                            <q-item-section>55.39</q-item-section>
                            <q-btn label="Send" color="primary" @click="DAIcard = true" />
                        </q-item>
                    </q-scroll-area>

                    <q-item >
                      <q-btn flat label="Add Friend" color="primary" @click="AddFriend = true" />
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
            <div class="flex items-center justify-center" v-else>
                <q-spinner color="primary" :thickness="2" size="3em" /> Unlocking wallet ...
            </div>
        </div>

    </div>
    <div class="column" v-else>
        <h6>No wallet found. Create a new wallet</h6>
        <q-input v-model="password" type="password" placeholder="enter password..." class="q-my-md" />
        <q-btn size="xl" @click="createWallet" color="primary" label="Create New Wallet" v-if="creating === false" />
        <div class="flex items-center justify-center" v-else>
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

    <q-dialog :maximized="true" transition-show="slide-up" transition-hide="slide-down" v-model="DAIcard">
        <q-card>
            <q-card-section class="row justify-between q-mb-lg">
                <div class="text-h6">Transfer Tokens</div>
                <q-space />
                <q-btn class="" icon="close" flat round dense @click="DAIcard = false" />
            </q-card-section>
            <q-card-section>

                <q-list bordered>

                    <q-item v-for="(contact, i) in contacts" clickable v-ripple v-bind:key="i" @click="selectRecipient(i)">
                        <q-item-section avatar>
                            <q-avatar square>
                                <img :src="blockies.create({seed: i})">
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>{{contacts[i]}}</q-item-section>
                        <q-item-section class="q-caption">
                          {{i.substring(0, 10)+"..."}}
                        </q-item-section>
                    </q-item>

                </q-list>

            </q-card-section>

            <q-card-section>
                <p> Or scan QR:</p>
                <q-btn flat color="primary" @click="QRScanner = true" >Scan</q-btn>
            </q-card-section>

            <q-card-section>
                <p>Amount in DAI:</p>
                <q-input v-model="daiTransfer.amount" placeholder="0.00 DAI" />
                <br>
                <q-input v-model="daiTransfer.to" placeholder="Enter address..." />
                <q-btn @click="sendDAI" flat color="primary">Send</q-btn>
            </q-card-section>

        </q-card>
    </q-dialog>

    <q-dialog v-model="QRScanner">
          <q-card>
            <q-card-section>
              <div class="text-h6">Scan address</div>
            </q-card-section>

            <q-card-section>
              <div>
                <p class="error">{{ error }}</p>


                <qrcode-stream @decode="onDecode" @init="onInit" />
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn flat label="Cancel" color="primary" @click="QRScanner = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>

    <q-dialog v-model="AddFriend">
          <q-card>
            <q-card-section>
              <div class="text-h6">Scan address</div>
            </q-card-section>

            <q-card-section>
              <div>

                <qrcode-stream @decode="onDecode" @init="onInit" />
              </div>
            </q-card-section>

            <q-card-section>
              <div class="text-h6">Friend Name</div>
              <q-input v-model="new3boxfriend.name" />
              <br>
              <q-input v-model="new3boxfriend.address" placeholder="Address..." />
              <q-btn flat label="Cancel" color="primary" @click="AddFriend = false" />
              <q-btn flat label="Add friend" color="primary" @click="newContact" />
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
import {
    supplyToCompound,
    mintByDai,
    compounded
} from '../util/compound'
import {
    utils
} from 'web3'
import {
    setInterval
} from 'timers';
import {
    open3Box
} from '../util/box'
import {transferDAI} from '../util/transfer'
import { QrcodeStream } from 'vue-qrcode-reader'
import {newContact, getContacts} from '../util/box'
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
            qrCode: '',
            mintingDAI: false,
            compounding: false,
            totalAvailable: 0,
            intrestEarned: 0,
            DAIcard: false,
            daiTransfer: {
              to: '',
              amount: ''
            },
            QRScanner: false,
            AddFriend: false,
            error: '',
            new3boxfriend: {
              address: '',
              name: ''
            },
            contacts: []
        }
    },
    components: { QrcodeStream },
    computed: mapState({
        exists: state => state.wallet.exists,
        address: state => state.wallet.wallet ? state.wallet.wallet.wallet.address : '',
        seed: state => state.wallet.wallet ? state.wallet.wallet.wallet.mnemonic : '',
        ethBalance: state => state.wallet.wallet ? state.wallet.ethBalance : '0.00',
        ethusd: state => state.wallet.ethusd,
        daiBalance: state => state.wallet.daiBalance,
        cdaiBalance: state => state.wallet.cdaiBalance
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
            this.pollBalances()

        },
        unlockWallet: async function () {
            let wallet
            try {
                this.unlocking = true
                wallet = await Wallet.getWallet(this.password)
                this.$store.dispatch('wallet/storeWallet', wallet)
                let ethBalance = await wallet.ethBalance()
                this.$store.dispatch('wallet/ethBalance', ethBalance)
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
            this.unlocking = false
            this.pollBalances()
            await open3Box(wallet.wallet)
            this.contacts = await getContacts()
            console.log(this.contacts)
        },
        getDAI: async function () {
            this.mintingDAI = true
            await mintByDai(this.$store.state.wallet.wallet.wallet)
            this.mintingDAI = false
        },
        pollBalances: async function () {
            setInterval(() => {
                this.$store.dispatch('wallet/polleth', this.$store.state.wallet.wallet)
                this.$store.dispatch('wallet/polldai', this.$store.state.wallet.wallet)
                this.$store.dispatch('wallet/pollcdai', this.$store.state.wallet.wallet)
                this.totalAvailableGas()
            }, 5000)
        },
        compoundDai: async function () {
            this.compounding = true
            await supplyToCompound(this.$store.state.wallet.wallet.wallet, utils.toWei('1000', 'ether'))
            this.compounding = false
        },
        totalAvailableGas: async function () {
            let compound = utils.fromWei(await compounded(), 'ether') || 100
            let intrest = this.cdaiBalance - compound
            console.log(this.cdaiBalance, compound)
            let intrestEarned = (intrest * 100).toFixed(4)
            let totalAvailable = gasusd(this.ethBalance, this.ethusd) + intrest
            this.intrestEarned = intrestEarned >= 0 ? intrestEarned : 0
            this.totalAvailable = totalAvailable >= 0 ? totalAvailable : 0
        },
        sendDAI: async function () {
          await transferDAI(this.daiTransfer.to, this.daiTransfer.amount, this.$store.state.wallet.wallet.wallet)
        },
        onDecode (result) {
          this.new3boxfriend.address = result.split(':')[1].slice(0, -1)
          this.daiTransfer.to = result.split(':')[1].slice(0, -1)
          this.QRScanner = false
        },

        async onInit (promise) {
          try {
            await promise
          } catch (error) {
            if (error.name === 'NotAllowedError') {
              this.error = "ERROR: you need to grant camera access permisson"
            } else if (error.name === 'NotFoundError') {
              this.error = "ERROR: no camera on this device"
            } else if (error.name === 'NotSupportedError') {
              this.error = "ERROR: secure context required (HTTPS, localhost)"
            } else if (error.name === 'NotReadableError') {
              this.error = "ERROR: is the camera already in use?"
            } else if (error.name === 'OverconstrainedError') {
              this.error = "ERROR: installed cameras are not suitable"
            } else if (error.name === 'StreamApiNotSupportedError') {
              this.error = "ERROR: Stream API is not supported in this browser"
            }
          }
        },
        newContact: async function (){
          await newContact(this.new3boxfriend.address, this.new3boxfriend.name)
        },
        selectRecipient(address) {
          this.daiTransfer.to = address
        }
    },
    async created() {
        let exists = await Wallet.exists()
        this.$store.dispatch('wallet/storeExists', exists)
        setInterval(() => {
            this.$store.dispatch('wallet/ethusd')
        }, 5000)
    },
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

.viewh {
    height: 30vh;
}
</style>
