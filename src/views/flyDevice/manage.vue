<template>
    <div class="mod-demo__news">
        <el-form :inline="true" :model="dataForm" @keyup.enter=" ">
            <el-form-item>
                <el-input v-model="dataForm.deviceName.value" placeholder="设备名称" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.deviceType.value" clearable placeholder="设备类型" style="width: 240px">
                    <el-option label="多旋翼" value="多旋翼" />
                    <el-option label="固定翼" value="固定翼" />
                    <el-option label="机场" value="机场" />
                    <el-option label="云盒" value="云盒" />
                </el-select>
            </el-form-item>
            &nbsp;
            <el-form-item>
                <el-input v-model="dataForm.deviceModel.value" placeholder="设备型号" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.deviceFactory.value" placeholder="设备厂家" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.deviceNumber.value" placeholder="设备序列号" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.deviceStatus.value" placeholder="设备状态" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="dataForm.equipmentProcurementTime.value" format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD" type="date" placeholder="选择日期" :size="size" />
            </el-form-item>
            <el-form-item>
                <el-input v-model="dataForm.deviceDepartment.value" placeholder="设备归属部门" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="query">{{ $t("query") }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
            </el-form-item>
        </el-form>
        <el-table v-loading="dataListLoading"
            :data="searchList.length === 0 ? dataList.slice(...computeListNum()) : searchList.slice(...computeListNum())"
            border @selection-change="dataListSelectionChangeHandle" @sort-change="dataListSortChangeHandle"
            style="width: 100%">
            <el-table-column prop="deviceName" label="设备名称" header-align="center" align="center"></el-table-column>
            <el-table-column prop="deviceType" label="设备类型" header-align="center" align="center"></el-table-column>
            <el-table-column prop="deviceModel" label="设备型号" header-align="center" align="center"></el-table-column>
            <el-table-column prop="deviceFactory" label="设备厂家" header-align="center" align="center"></el-table-column>
            <el-table-column prop="deviceNumber" label="设备序列号" header-align="center" align="center"></el-table-column>
            <el-table-column prop="deviceStatus" label="设备状态" header-align="center" align="center"></el-table-column>
            <el-table-column prop="equipmentProcurementTime" label="设备采购时间" header-align="center"
                align="center"></el-table-column>
            <el-table-column prop="deviceDepartment" label="设备归属部门" header-align="center"
                align="center"></el-table-column>
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
import AddOrUpdate from "@/views/flyDevice/flyDevice-add-or-update.vue";
export default defineComponent({
    components: {
        AddOrUpdate
    },
    setup() {
        const state = reactive({
            dataForm: {
                deviceName: {
                    value: "",
                    type: "string"
                },
                deviceType: {
                    value: "",
                    type: "string"
                },
                deviceModel: {
                    value: "",
                    type: "string"
                },
                deviceFactory: {
                    value: "",
                    type: "string"
                },
                deviceNumber: {
                    value: "",
                    type: "string"
                },
                deviceStatus: {
                    value: "",
                    type: "string"
                },
                equipmentProcurementTime: {
                    value: "",
                    type: "date"
                },
                deviceDepartment: {
                    value: "",
                    type: "string"
                }
            },
            dataList: [
                {
                    deviceName: "大疆无人机1",
                    deviceType: "多旋翼",
                    deviceModel: "10001",
                    deviceFactory: "大疆",
                    deviceNumber: "20002",
                    deviceStatus: "正常",
                    equipmentProcurementTime: "2022-01-01",
                    deviceDepartment: "技术部"
                },
                {
                    deviceName: "大疆无人机2",
                    deviceType: "固定翼",
                    deviceModel: "10002",
                    deviceFactory: "大疆",
                    deviceNumber: "30003",
                    deviceStatus: "异常",
                    equipmentProcurementTime: "2022-01-02",
                    deviceDepartment: "技术部"
                },
                {
                    deviceName: "大疆无人机3",
                    deviceType: "机场",
                    deviceModel: "10001",
                    deviceFactory: "大疆",
                    deviceNumber: "20002",
                    deviceStatus: "正常",
                    equipmentProcurementTime: "2022-01-03",
                    deviceDepartment: "技术部"
                },
                {
                    deviceName: "大疆无人机4",
                    deviceType: "云盒",
                    deviceModel: "13451",
                    deviceFactory: "大疆",
                    deviceNumber: "26782",
                    deviceStatus: "异常",
                    equipmentProcurementTime: "2022-01-04",
                    deviceDepartment: "技术部"
                },
                {
                    deviceName: "大疆无人机5",
                    deviceType: "多旋翼",
                    deviceModel: "11231",
                    deviceFactory: "大疆",
                    deviceNumber: "12345",
                    deviceStatus: "正常",
                    equipmentProcurementTime: "2022-01-04",
                    deviceDepartment: "技术部"
                },
            ],
            paginationParams: {
                pageSize: 5,
                currentPage: 1,
                sizeList: [5, 10, 15, 20]
            },
            searchList: [],
            size:"default"
        })
        const query = () => {
            vlookup(state.dataForm, state.dataList, (res) => {
                state.searchList = res;
            })
        }
        const changePageSize = (s) => { // 修改分页展示量
            state.paginationParams.pageSize = s;
        }
        const changeCurrentPage = (page) => { // 更新分页页码
            state.paginationParams.currentPage = page;
        }
        const computeListNum = () => { // 计算分页数据
            return [(state.paginationParams.currentPage - 1) * state.paginationParams.pageSize, state.paginationParams.currentPage * state.paginationParams.pageSize]
        }
        return {
            ...useView(state),
            ...toRefs(state),
            query,
            changePageSize,
            changeCurrentPage,
            computeListNum
        }
    },
    methods: {

    }
})


</script>

<style></style>