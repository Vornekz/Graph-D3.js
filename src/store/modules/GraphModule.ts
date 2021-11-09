import { Module, VuexModule, Mutation, Action} from 'vuex-module-decorators'
import * as d3 from "d3";

@Module({namespaced: true})
export default class GraphModule extends VuexModule {
    public dataset: object[] = [];

    get group() {
        return (groupOrder: string[]) => {
            if (groupOrder[0] && groupOrder[1]) {
                return d3.group(this.dataset, (d: any) => d[groupOrder[0]], (d: any) => d[groupOrder[1]])
            } else if (groupOrder[0]) {
                return d3.group(this.dataset, (d: any) => d[groupOrder[0]])
            } else return this.dataset
        }
    }

    @Mutation
    updateData(graphData: object[]){
        this.dataset = graphData || []
    }

    @Action({ commit: "updateData" })
    async graphData(): Promise<object[] | undefined> {
        return await d3.json("data/cities.json");
    }
}