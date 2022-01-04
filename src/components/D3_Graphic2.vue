<template>
  <section>
    <div id="graph2">
      <svg id="svg2"
           :width="width"
           :height="height"
           :viewBox="`0, -20, ${width + 200}, ${height + 100}`">
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
  private newGroup: any[] = [];
  private hierarchy: HierarchyNode<any> = d3.hierarchy({});

  get layout() {
    return d3.tree()
        .size([this.width, this.height])
  }

  get groupData() {
    return ["World", this.group(this.groupOrder)]
  }

  createHierarchy(val: any) {
    const hierarchy = d3.hierarchy(val, (v) => v[1])

    hierarchy.sum(v => v.population).value

    hierarchy.sort((a, b) => d3.ascending(b.value, a.value))

    this.layout(hierarchy)

    this.hierarchy = hierarchy;

    d3.select("#svg2").select("g").remove();

    this.createLinks()
    this.createCircle()
    this.createText()
  }

  createLinks() {
    d3.select("#svg2")
        .append("g")
          .append("g")
            .attr("fill", "none")
            .selectAll("path")
              .data(this.hierarchy.links())
              .enter()
                .append("path")
                .attr("d", (d: any) => {
                  return d3.linkHorizontal()({
                    source: [d.source.y, d.source.x],
                    target: [d.target.y, d.target.x]
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

                    d3.select("#svg2")
                        .selectAll(`text`)
                        .filter(function():boolean {
                          return d3.select(this).text() == d.target.value  + " " + "people"
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

                    d3.select("#svg2")
                        .selectAll(`text`)
                        .filter(function():boolean {
                          return d3.select(this).text() == d.target.value  + " " + "people"
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
            .data(this.hierarchy.descendants())
            .enter()
              .append("circle")
                .attr("transform", (d: any) => {
                  return `translate(${d.y + this.radius}, ${d.x})`
                })
                .attr("r", (d: any) => d.children != null ? `${this.radius}`: "0")
                .attr("fill", "#fff")
                .attr("fill-opacity",(d: any) => d.children == null ? "0" : "1")
                .attr("cursor", "pointer")
                .on("click", (event, d: any) => {
                  if (d.children && d.parent) {
                    this.newGroup = d.data
                  }
                  if (!d.parent && d.data[0] !== "World") {
                    this.newGroup = this.groupData
                  }
                })
                .on("mouseover", (event, d: any) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#a8c441")

                    d3.select("#svg2")
                        .selectAll(`text`)
                        .filter(function():boolean {
                          return d3.select(this).text() == (d.value * 0.000001).toFixed(2) + "m " + "people"
                        })
                        .attr("fill-opacity", "1")

                })
                .on("mouseout", (event, d: any) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#fff")

                    d3.select("#svg2")
                        .selectAll(`text`)
                        .filter(function():boolean {
                          return d3.select(this).text() == (d.value * 0.000001).toFixed(2) + "m " + "people"
                        })
                        .attr("fill-opacity", "0")
                })
  }

  createText() {
    d3.select("#svg2")
        .select("g")
          .append("g")
            .selectAll("text")
            .data(this.hierarchy.descendants())
            .enter()
              .append("text")
                .attr("transform", (d: any) => {
                   return d.children == null ? `translate(${d.y + 10},${d.x + 10})` : `translate(${d.y},${d.x - 10})`
                })
                .text((d: any) => d.data[0]? d.data[0]: d.data.key)
                  .attr("fill", "#c1c1d0")
                  .attr("fill-opacity", (d: any) => d.children == null ? "0" : "1")
                  .attr("font-size", "15px")
                  .style("user-select", "none")

    d3.select("#svg2")
        .select("g")
          .append("g")
            .selectAll("text")
            .data(this.hierarchy.descendants())
            .enter()
              .append("text")
              .attr("transform", (d: any) => {
                return d.parent == null ? `translate(${d.y},${d.x - 30})` : d.children == null ? `translate(${d.y + 10},${d.x + 25})` : `translate(${d.y - 115},${d.x - 10})`
              })
                .text((d: any) =>d.children == null ? d.value + " " + "people" : (d.value * 0.000001).toFixed(2) + "m " + "people")
                  .attr("fill", "#c1c1d0")
                  .attr("fill-opacity", "0")
                  .attr("font-size", "15px")
                  .style("user-select", "none")
  }

  @Watch("groupData")
  onGroupDataChanged(val: any[]) {
    this.createHierarchy(val)
    console.log(this.hierarchy.descendants())

  }

  @Watch("newGroup")
  onNewGroupChanged(val: any[]) {
    this.createHierarchy(val)
  }

}
</script>

<style lang="scss" scoped>
#graph2 {
  display: flex;
  position: relative;
  justify-content: center;
}
</style>