<template>
  <div id="app">
    <D3_Graphic class="graphic"
                :group="group"
                :dataset="dataset"/>
    <D3_Graphic2 class="graphic2"
                 :group="group"
                 :dataset="dataset"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {namespace} from "vuex-class";
import D3_Graphic from "@/components/D3_Graphic.vue";
import D3_Graphic2 from "@/components/D3_Graphic2.vue";

const graphModule = namespace("GraphModule")

@Component({
  name: "App",
  components: {
    D3_Graphic,
    D3_Graphic2
  }
})
export default class App extends Vue {
  @graphModule.State readonly dataset!: object[];
  @graphModule.Getter protected group!: (groupOrder: string[]) => any;
  @graphModule.Action protected graphData!: () => Promise<object[] | undefined>;

  async mounted() {
    await this.graphData()
  }
}
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background-color: #32334f;

  .graphic {
    min-height: 100vh;
    box-sizing: unset;
  }
  .graphic2 {
    min-height: 100vh;
  }


}
</style>
