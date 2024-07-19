<template>
    <div class="mod-demo__news">
        <el-form :inline="true" :model="dataForm" @keyup.enter=" ">
            <el-form-item>
                <el-input v-model="dataForm.fireName.value" placeholder="姓名" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.company.value" placeholder="单位" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.certificateType.value" placeholder="证书类型" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="queryFn">{{ $t("query") }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
            </el-form-item>
        </el-form>
        <el-table v-loading="dataListLoading"
            :data="searchList.length === 0 ? dataList.slice(...computeListNum()) : searchList.slice(...computeListNum())"
            border @selection-change="dataListSelectionChangeHandle" @sort-change="dataListSortChangeHandle"
            style="width: 100%">
            <el-table-column prop="fireName" label="姓名" header-align="center" align="center"></el-table-column>
            <el-table-column prop="company" label="单位" header-align="center" align="center"></el-table-column>
            <el-table-column prop="certificateType" label="证书类型" header-align="center" align="center"></el-table-column>
            <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
                <template v-slot="scope">
                    <el-button type="text" size="small" @click="addOrUpdateItem(scope.row)">{{ $t("update")
                        }}</el-button>
                    <el-button type="text" size="small" @click="deleteRowItem(scope.row.id)">{{ $t("delete")
                        }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination :current-page="paginationParams.currentPage" :page-sizes="paginationParams.sizeList"
            :page-size="paginationParams.pageSize"
            :total="searchList.length === 0 ? dataList.length : searchList.length"
            layout="total, sizes, prev, pager, next, jumper" @size-change="changePageSize"
            @current-change="changeCurrentPage">
        </el-pagination>
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, ref, toRefs } from "vue";
import { vlookup } from "@/utils/utils";
import AddOrUpdate from "@/views/flyPeople/flyPeople-add-or-update.vue";
export default defineComponent({
    components: {
        AddOrUpdate
    },
    setup() {
        const state = reactive({
            dataForm: {
                fireName: {
                    value: "",
                    type: "string"
                },
                company: {
                    value: "",
                    type: "string"
                },
                certificateType: {
                    value: "",
                    type: "string"
                }
            },
            dataList: [ // 数据列表
                {
                    fireName: "卢怿泽",
                    company: "乐清湾海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "邵天然",
                    company: "乐清湾海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "张驰",
                    company: "瓯江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "吕志杭",
                    company: "瓯江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "宫鹏飞",
                    company: "鳌江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "蔡  宇",
                    company: "鳌江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "贾江泽",
                    company: "鳌江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "刘弘扬",
                    company: "飞云江海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "陈生根",
                    company: "苍南工作组",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "冯泽云",
                    company: "洞头海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "王五",
                    company: "绍兴市",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "袁明浩",
                    company: "洞头海事处",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "严鹏飞",
                    company: "海巡执法支队",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
                {
                    fireName: "杜禹",
                    company: "指挥中心",
                    certificateType: "超视距无人驾驶航空器操控员",
                },
            ].map((item, index) => {
                return { ...item, id: index + 1 }
            }),
            paginationParams: {
                pageSize: 5,
                currentPage: 1,
                sizeList: [5, 10, 15, 20]
            },
            searchList: [],
            dialogVisible: false
        })
        const deleteRowItem = (id) => { // 删除数据
            console.log(id);
        }
        const changePageSize = (s) => { // 修改分页展示量
            state.paginationParams.pageSize = s;
        }
        const changeCurrentPage = (page) => { // 更新分页页码
            state.paginationParams.currentPage = page;
        }
        const queryFn = () => { // 查询
            vlookup(state.dataForm, state.dataList, (res) => {
                state.searchList = res;
            })
        }
        const computeListNum = () => { // 计算分页数据
            return [(state.paginationParams.currentPage - 1) * state.paginationParams.pageSize, state.paginationParams.currentPage * state.paginationParams.pageSize]
        }
        return {
            ...useView(state),
            ...toRefs(state),
            computeListNum,
            queryFn,
            changeCurrentPage,
            changePageSize,
            deleteRowItem,
        }
    }
})


</script>

<style></style>