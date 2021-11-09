import Vue from "vue"
import Vuex from "vuex"
import GraphModule from "@/store/modules/GraphModule";

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        GraphModule
    }
})

export default store