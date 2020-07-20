<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="rolesList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot:default="slotProps">
            <el-row v-for="(item, i) in slotProps.row.children"
            :key="item.id" :gutter="20" :class="['bdbottom','vcenter', i == 0 ? 'bdtop' : '']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(slotProps.row, item.id)">{{ item.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 演染二级权限 -->
              <el-col :span="19">
                <el-row v-for="(item1, i1) in item.children" :key="item1.id"
                :gutter="20" :class="[i1 !== 0 ? 'bdtop' : '','vcenter']">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(slotProps.row, item1.id)"
                    type="success">{{ item1.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三极权限 -->
                    <!-- <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                    :gutter="20" :class="i2 < item1.children.length-1 ? 'bdbottom' : ''">
                      <el-tag>{{ item2.authName }}</el-tag>
                    </el-row> -->
                    <el-tag type="warning" v-for="item2 in item1.children"
                    closable @close="removeRightById(slotProps.row, item2.id)" :key="item2.id">
                      {{ item2.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(slotProps.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="delRole(slotProps.row.id)">删除</el-button>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
              @click="showSetRightDialog(slotProps.row)">分配权限</el-button>
            </el-tooltip>
            <!-- {{slotProps.row.id}} -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible"
    @close="setRightDialogClosed" width="50%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList" :props="treeProps" ref="treeRef"
        show-checkbox node-key="id" default-expand-all class="treeShow"
        :default-checked-keys="defKeys" @check-change="handleCheckChange">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editRoleForm: {},
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      setRightDialogVisible: false,
      rightsList: [],
      // 树形控件的绑定的对像
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的Key
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles').catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(res.data)
    },
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        // 还可以加个参数 tip..未通过验证的字段数组
        if (!valid) {
          return 
        }
        const { data: res } = await this.$http.post('roles', this.addRoleForm).catch(e => e)
        if (!res) return this.$message.error('网络错误')
        if (res.meta.status !== 201) {
          return this.$message.error('创建角色失败')
        }
        this.$message.success('创建角色成功')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    addDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    async delRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 不写catch 有问题,会报错
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    editDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editRoleForm = res.data
      this.editDialogVisible = true
    },
    async editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        // 还可以加个参数 tip..未通过验证的字段数组
        if (!valid) {
          return 
        }
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        }).catch(e => e)
        if (!res) return this.$message.error('网络错误')
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑提交出错')
        }
        this.$message.success('编辑成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    async removeRightById(role, rightsId) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      // this.getRolesList() 不用这个会发生刷新,把展开的部分关闭
      role.children = res.data
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree').catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      }).catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    handleCheckChange(data) {
      // console.log(data)
    },
    // 通过递归获取角色下的所有三级权限ID
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含 children 属性
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>
<style lang="less" scoped>
.bdtop {
  border-top: 1px solid #dddddd;
}
.bdbottom {
  border-bottom: 1px solid #dddddd;
}
.el-tag {
  margin: 7px;
}
.vcenter {
  display: flex;
  align-items: center;
}
// .el-row {
//   display: flex;
//   align-items: center;
// }
.treeShow {
  height: 500px;
  overflow-y: scroll;
}
</style>