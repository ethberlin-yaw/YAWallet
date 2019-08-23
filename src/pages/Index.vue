<template>
  <q-page class="flex flex-center">
    <div class="column text-center" v-if="exists">
            <div v-if="address != ''">
         <q-chip>
        <q-avatar color="red" text-color="white">
          <img :src="blockies.create({seed: address})" />
        </q-avatar>
        {{address}}
      </q-chip>
      </div>
      <div v-else>
               <h6>Unlock your wallet</h6>
      <q-input v-model="password" type="password" placeholder="enter password..." class="q-my-md" :disabled="unlocking" />
      <q-btn color="primary" size="xl" @click="unlockWallet" label="Unlock Wallet" v-if="unlocking === false" />
             <div class="flex" v-else>
         <q-spinner color="primary" :thickness="2" size="3em" /> Unlocking wallet ...
       </div>
      </div>

    </div>
    <div class="column" v-else>
       <h6>No wallet found. Create a new wallet</h6>
             <q-input v-model="password" type="password" placeholder="enter password..." class="q-my-md" />
       <q-btn  size="xl" @click="createWallet" color="primary" label="Create New Wallet" v-if="creating === false"/>
       <div class="flex" v-else>
         <q-spinner color="primary" :thickness="2" size="3em" /> Creating wallet ...
       </div>
    </div>
  </q-page>
</template>

<style>
</style>

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
      blockies: blockies
    }
  },
  computed: mapState({
    exists: state => state.wallet.exists,
    address: state => state.wallet.wallet ? state.wallet.wallet.address : ''
  }),
  methods: {
    createWallet: async function() {
      this.creating = true
      let wallet = await Wallet.create(this.password)
       this.$store.dispatch('wallet/storeWallet', wallet)
       console.log(wallet)
      this.creating = false
    },
    unlockWallet: async function() {
      this.unlocking = true
      let wallet = await Wallet.getWallet(this.password)
      console.log(wallet)
      this.$store.dispatch('wallet/storeWallet', wallet)
      this.unlocking = false
    }
  },
  async created () {
    let exists = await Wallet.exists()
    this.$store.dispatch('wallet/storeExists', exists)
  }
}
</script>
