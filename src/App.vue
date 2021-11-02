<template>
  <div id="app">
    <D3_Graphic class="graphic"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import D3_Graphic from "@/components/D3_Graphic.vue";

@Component({
  name: "App",
  components: {
    D3_Graphic
  }
})
export default class App extends Vue {

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

}
</style>
