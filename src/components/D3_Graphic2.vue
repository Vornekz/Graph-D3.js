<template>
  <section>
    <div id="graph2">
      <svg id="svg2"
           :width="width"
           :height="height"
           :viewBox="`0, 0, ${width}, ${height}`">
        <g></g>
      </svg>
    </div>
  </section>
</template>

<script lang="ts">
import {Component, Watch, Vue, Prop} from 'vue-property-decorator';
import * as d3 from "d3"
import {HierarchyNode, text} from "d3";

@Component({
  name: "D3_Graphic2"
})

export default class D3_Graphic2 extends Vue {
  @Prop({type: Array, required: true}) readonly dataset!: object[];
  @Prop({type: Function, required: true}) readonly group!: (groupOrder: string[]) => any;

  private width: number = 1100;
  private height: number = 1100;
  private radius: number = 6;
  private groupOrder: string[] = ["region", "subregion"];
  private h: HierarchyNode<any> = d3.hierarchy({});

  get layout() {
    return d3.tree()
        .size([this.width, this.height])
  }

  get groupData() {
    return ["World", this.group(this.groupOrder)]
  }

  createHierarchy(val: any) {
    const h = d3.hierarchy(val, (v) => v[1])

    h.sum(v => v.population).value

    h.sort((a, b) => d3.ascending(b.value, a.value))

    this.layout(h)

    this.h = h;

    this.createLinks()
    this.createCircle()
    this.createText()
  }

  createLinks() {
    d3.select("#svg2")
        .select("g")
        .append("g")
          .attr("fill", "none")
        .selectAll("path")
          .data(this.h.links())
          .enter().append("path")
            .attr("d", (d: any) => {
              return d3.linkHorizontal()({
                source: [d.source.y, d.source.x],
                target: d.target.children == null?[d.target.y - 140, d.target.x]:[d.target.y, d.target.x]
              })
            })
            .attr("stroke", "#c44141")
            .attr("stroke-width", "3")
        .on("mouseover", (event, d: any) => {
          if (d.target.children == null) {
            d3.select(event.currentTarget)
                .attr("stroke", "#a8c441")

            d3.select("#svg2")
                .selectAll(`text`)
                  .filter(function():boolean {
                    return d3.select(this).text() == d.target.data.key
                  })
                  .attr("fill-opacity", "1")
          }
        })
        .on("mouseout", (event, d: any) => {
          if (d.target.children == null) {
            d3.select(event.currentTarget)
                .attr("stroke", "#c44141")

            d3.select("#svg2")
                .selectAll(`text`)
                  .filter(function():boolean {
                    return d3.select(this).text() == d.target.data.key
                  })
                  .attr("fill-opacity", "0")
          }
        })
  }

  createCircle() {
    d3.select("#svg2")
        .select("g")
        .append("g")
        .selectAll("circle")
        .data(this.h.descendants())
        .enter()
          .append("circle")
            .attr("transform", (d: any) => {
              return `translate(${d.y + this.radius},${d.x})`
            })
            .attr("r", this.radius)
            .attr("fill", "#fff")
            .attr("fill-opacity",(d: any) => d.children == null? "0": "1")
            .attr("cursor", "pointer")
  }

  createText() {
    d3.select("#svg2")
        .select("g")
        .append("g")
        .selectAll("text")
        .data(this.h.descendants())
        .enter()
          .append("text")
            .attr("transform", (d: any) => {
               return d.children == null?`translate(${d.y - 130},${d.x + 5})`:`translate(${d.y},${d.x - 10})`
            })
            .text((d: any) => d.data[0]? d.data[0]: d.data.key)
              .attr("fill", "#c1c1d0")
              .attr("fill-opacity", (d: any) => d.children == null? "0": "1")
              .attr("font-size", "13px")
  }

  @Watch("groupData")
  onGroupDataChanged(val: any[]) {
    this.createHierarchy(val)
  }

}
</script>

<style lang="scss" scoped>
#graph2 {
  display: flex;
  justify-content: center;
}
</style>