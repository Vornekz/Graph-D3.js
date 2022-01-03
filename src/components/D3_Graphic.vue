<template>
  <section>
    <div class="buttons">
      <button class="button"
              v-if="groupOrder[0] || groupOrder[1]"
              @click="groupOrder = []">
        Reset grouping
      </button>
      <button class="button"
              v-if="groupOrder[1] || groupOrder.length !== 1"
              @click="groupOrder = []; groupOrder.push('region')">
        Group by region
      </button>
      <button class="button"
              v-if="groupOrder.length === 1"
              @click="groupOrder.push('subregion')">
        Group by subregion
      </button>
    </div>
    <div id="graph">
      <svg id="svg">
        <g></g>
      </svg>
      <div id="tooltip"></div>

    </div>
  </section>
</template>

<script lang="ts">
import {Component, Watch, Vue, Prop} from 'vue-property-decorator';
import * as d3 from "d3"
import {HierarchyNode} from "d3";


@Component({
  name: "D3_Graphic"
})

export default class D3_Graphic extends Vue {
  @Prop({type: Array, required: true}) readonly dataset!: object[];
  @Prop({type: Function, required: true}) readonly group!: (groupOrder: string[]) => any;

  private height: number = 40;
  private radius: number = this.height / 2;
  private color: Function = d3.scaleOrdinal(["#828da7", "#b06c67", "#d17a7a", "#9b6165", "#846b8d", "#a1acd0"]);
  private h: HierarchyNode<any> = d3.hierarchy({});
  private newGroup: any[] = [];
  private groupOrder: string[] = [];

  createHierarchy(val: any) {
    const h = d3.hierarchy(val, (v) => v[1])

    h.sum(v => v.population).value

    h.sort((a, b) => d3.ascending(b.value, a.value))

    this.layout(h)

    this.h = h;

    d3.select("#svg").select("g").remove();

    this.createArc()
    this.createText()
  }

  createSvg() {
    let width: number = 900;
    let height: number = 900;
    return d3.select("#svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("svg:g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  }

  arc(): any {
    return d3.arc()
        .startAngle((d: any) => d.x0)
        .endAngle((d: any) => d.x1)
        .innerRadius((d: any) => d.y0)
        .outerRadius((d: any) => d.y1)
  }

  arcHover(): any {
    return d3.arc()
        .startAngle((d: any) => d.x0)
        .endAngle((d: any) => d.x1)
        .innerRadius((d: any) => d.y0)
        .outerRadius((d: any) => d.y1 + 20)
  }

  createArc() {
    this.createSvg().append("g")
        .selectAll("path")
        .data(this.h.descendants().reverse())
        .enter().append("svg:path")
        .transition()
        .delay((d, i) => {
          return i * 10;
        })
        .attrTween("d", (d: any) => {
          let i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
          let arc = this.arc()
          return function (t: any) {
            d.endAngle = i(t);
            return arc(d)
          }
        })

    d3.select("#svg")
        .selectAll("path").attr("fill-rule", "evenodd")
        .style("stroke", "#E1D9DFCC")
        .style("stroke-width", "0.2")
        .style('fill', (d: any) => this.color((d.children ? d : d.parent).data))
        .attr("cursor", "pointer")
        .attr("fill-opacity", "0.6")
        .on("click", (event, d: any) => {
          if (d.children && d.parent) {
            this.newGroup = d.data
          }
          if (!d.parent && d.data[0] !== "World") {
            this.newGroup = this.groupData
          }
        })
        .on("mouseover", (event, d: any) => {
          d3.select("#tooltip")
              .html((d.data[0] ? d.data[0] : d.data.key) + "<br/>" + `Population = ${(d.value * 0.000001).toFixed(3)} milion`)
              .transition().delay(200)
              .style("opacity", "1")
              .style("color", "#c1c1d0")

          d3.select(event.currentTarget)
              .transition().delay(100)
              .attr("d", this.arcHover())
              .attr("fill-opacity", "1")
              .style("stroke", "none")
        })
        .on("mouseout", (event) => {
          d3.select("#tooltip")
              .transition().delay(200)
              .style("opacity", "0")

          d3.select(event.currentTarget)
              .transition().delay(100)
              .attr("d", this.arc())
              .attr("fill-opacity", "0.6")
              .style("stroke", "#E1D9DFCC")
        })
  }

  createText() {
    d3.select("#svg")
        .select("g")
        .append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(this.h.descendants())
        .join("text")
        .attr("fill", "#c1c1d0")
        .attr("font-size", "13px")
        .attr("fill-opacity", (d: any) => Number(this.labelVisible(d)))
        .attr("transform", (d: any) => this.labelTransform(d))
        .transition().delay(this.h.descendants().length * 10)
        .text((d: any) => d.data[0] ? d.data[0] : d.data.key)
  }


  labelVisible(d: any) {
    return (d.y1 - d.y0) * (d.x1 - d.x0) > 10;
  }

  labelTransform(d: any) {
    if (d.y0 > 0) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / this.height * this.radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
    } else return ""
  }

  get layout() {
    return d3.partition()
        .size([2 * Math.PI, this.radius * this.radius])
  }

  get groupData() {
    return ["World", this.group(this.groupOrder)]
  }

  @Watch("layout")
  onLayoutChanged() {
    this.layout(this.h)
  }

  @Watch("newGroup")
  onHierarchyChanged(val: any[]) {
    this.createHierarchy(val)
  }

  @Watch("groupData")
  onGroupDataChanged(val: any[]) {
    this.createHierarchy(val)
  }

}
</script>

<style lang="scss" scoped>
section {
  display: flex;
  justify-content: center;
  align-items: center;

  #graph {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70%;
    padding: 30px;
    position: relative;

    #svg {
      width: 100%;
      height: 100%;
    }

    #tooltip {
      position: absolute;
      top: 0;
      padding: 10px;
      border-radius: 15px;
      background-color: #f7ddff59;
      opacity: 0;
      text-align: center;
    }
  }

  .buttons {
    display: flex;
    flex-direction: column;

    .button {
      width: 150px;
      height: 50px;
      border: none;
      border-radius: 25px;
      margin-bottom: 10px;
      background-color: #f7ddff59;
      outline: none;
      color: #D9D9DEFF;

      &:hover {
        background-color: #b28282;
      }
    }
  }
}

</style>