<template>
  <q-page class="flex flex-center">
    <div class="column text-center" v-if="exists">
            <div v-if="address != ''">
         <q-chip class="avatar-chip">
        <q-avatar size="2em" color="red" text-color="white">
          <img :src="blockies.create({seed: address})" />
        </q-avatar>
        {{address}}
        
      </q-chip>
      <div>
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
       <q-btn  size="xl" @click="createWallet" color="primary" label="Create New Wallet" v-if="creating === false"/>
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
import {mapState} from 'vuex'
import Wallet from '../util/wallet'
import blockies from '../util/blockies'
export default {
  name: 'PageIndex',
  data () {
    return {
      password: '',
      creating: false,
      unlocking: false,
      blockies: blockies,
      revealSeed: false,
    }
  },
  computed: mapState({
    exists: state => state.wallet.exists,
    address: state => state.wallet.wallet ? state.wallet.wallet.address : '',
    seed: state => state.wallet.wallet ? state.wallet.wallet.mnemonic : ''
  }),
  methods: {
    createWallet: async function() {
      if (this.password.length < 2) {
        this.$q.notify({
          timeout: 5000,
          color: 'red',
          textColor: 'white',
          message: "Enter a decent password !",
           actions: [{ icon: 'close', color: 'white' }]
        })
        return
      }
      try {
      this.creating = true
      let wallet = await Wallet.create(this.password)
       this.$store.dispatch('wallet/storeWallet', wallet.wallet)
        let exists = await Wallet.exists()
    this.$store.dispatch('wallet/storeExists', exists)
      } catch(e) {
        this.$q.notify({
          timeout: 5000,
          color: 'red',
          textColor: 'white',
          message: e.message,
           actions: [{ icon: 'close', color: 'white' }]
        })
      }
      this.creating = false
    },
    unlockWallet: async function() {
      try {
              this.unlocking = true
      let wallet = await Wallet.getWallet(this.password)
      console.log(wallet)
      this.$store.dispatch('wallet/storeWallet', wallet)
      } catch (e) {
        this.$q.notify({
          timeout: 5000,
          color: 'red',
          textColor: 'white',
          message: e.message,
           actions: [{ icon: 'close', color: 'white' }]
        })
      }
      this.unlocking = false
    }
  },
  async created () {
    let exists = await Wallet.exists()
    this.$store.dispatch('wallet/storeExists', exists)
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