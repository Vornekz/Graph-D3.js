<template>
  <div id="app">
    <div class="tabs">
      <button class="button1"
              :class="{'selected': selected}"
          @click="changeButton1">
        Graphic 1
      </button>
      <button class="button2"
              :class="{'selected': !selected}"
          @click="changeButton2">
        Graphic 2
      </button>
    </div>
    <D3_Graphic class="graphic"
                v-if="tabs === 'graph1'"
                :group="group"
                :dataset="dataset"/>
    <D3_Graphic2 class="graphic2"
                 v-if="tabs === 'graph2'"
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

  private tabs: string = "graph1"
  private selected: boolean = true

  async mounted() {
    await this.graphData()
  }

  changeButton1() {
    this.tabs = "graph1"
    this.selected = true
    this.graphData()
  }
  changeButton2() {
    this.tabs = "graph2"
    this.selected = false
    this.graphData()
  }
}
</script>

<style lang="scss">
@import "assets/mixins";

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background-color: #32334f;

  .tabs {
    position: absolute;
    right: 0;
    z-index: 1;


    .button1 {
      @include changeButtonStyle();
      border-bottom-left-radius: 60%;
      border-bottom-right-radius: 10%;
      transition: .2s;

      &:hover {
       border: 4px #9E9EC48C solid;
      }
    }

    .button2 {
      @include changeButtonStyle();
      border-bottom-right-radius: 60%;
      border-bottom-left-radius: 10%;
      transition: .2s;

      &:hover {
        border: 4px #9E9EC48C solid;
      }
    }

    .selected {
      pointer-events: none;
      border: 4px #9E9EC48C solid;
    }
  }


  .graphic {
    min-height: 100vh;
    box-sizing: unset;
  }
  .graphic2 {
    min-height: 100vh;
  }


}
</style>
