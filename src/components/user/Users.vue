<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- gutter 间距 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"
          clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
        </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userlist" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="slotProps">
            <!-- {{ slotProps.row.mg_state }} -->
            <el-switch v-model="slotProps.row.mg_state"
            active-text="开" inactive-text="关"
            @change="userStateChanged(slotProps.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(slotProps.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="delUser(slotProps.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
              @click="setRole(slotProps.row)"></el-button>
            </el-tooltip>
            <!-- {{slotProps.row.id}} -->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"  type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="密码确认" prop="checkPassword">
          <el-input v-model="addUserForm.checkPassword"  type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>分配新角色: 
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.addUserForm.checkPass !== '') {
          this.$refs.addUserFormRef.validateField('checkPassword')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addUserForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const checkMobile = (rule, value, callback) => {
      // if (String(value).length < 13 | String(value).length > 10) {
      //   return callback(new Error('请输入正确的手机位数'))
      // }
      // 视频里用正则..更严格点
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userlist: [],
      total: 0,
      // 控制对话框显示
      addDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        checkPassword: '',
        email: '',
        mobile: ''
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          // { min: 10, max: 13, message: '请输入正确的手机号', trigger: 'blur' },
          { type: 'number', message: '必须输入数字', trigger: 'blur' },
          // 上面两条规则冲突..一个要求是字符串,一个要求是数值
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      // editUserForm: {
      //   id: '',
      //   username: '',
      //   email: '',
      //   mobile: ''
      // },
      editUserForm: {},
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          // { min: 10, max: 13, message: '请输入正确的手机号', trigger: 'blur' },
          { type: 'number', message: '必须输入数字', trigger: 'blur' },
          // 上面两条规则冲突..一个要求是字符串,一个要求是数值
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败!')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 页码值 改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged(userinfo) {
      // console.log(userinfo)
      // userinfo.id = 33333 //不能弄..发个错的直接后端都停了..
      // const { data: res } = await this.$http.put('users/' + userinfo.id + '/state/' + userinfo.mg_state)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        // 还可以加个参数 tip..未通过验证的字段数组
        if (!valid) {
          return 
        }
        // console.log(this.addUserForm)
        // delete this.addUserForm.checkPassword
        // console.log(this.addUserForm)
        // 直接删也是出事情..date里定义的那个下次再打开就没这属性了,出其它事情
        // const user = this.addUserForm
        // delete user.checkPassword
        // 2个一起删了.
        // const user = {
        //   username: this.addUserForm.username,
        //   password: this.addUserForm.password,
        //   email: this.addUserForm.email,
        //   mobile: this.addUserForm.mobile
        // }
        const { checkPassword, ...user } = this.addUserForm
        const { data: res } = await this.$http.post('users', user)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(row) {
      // this.editUserForm.id = row.id
      // this.editUserForm.username = row.username
      // this.editUserForm.email = row.email
      // this.editUserForm.mobile = row.mobile
      const { data: res } = await this.$http.get(`users/${row.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editUserForm = res.data
      // console.log(this.editUserForm)
      this.editDialogVisible = true
    },
    editDialogClosed() {
      // 本来写了这句又注了,我觉得不需要,还是需要重置下验证
      this.$refs.editUserFormRef.resetFields()
    },
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        // const { username, ...user } = this.editUserForm
        // 上面我自已写的,打开编辑卡的时候没查询,下面跟视频
        const { username, role_id, ...user } = this.editUserForm
        // console.log(user, username, role_id)
        const { data: res } = await this.$http.put(`users/${user.id}`, user)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async delUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 不写catch 有问题,会报错
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`users/${id}`)
      // 一开始没写成 异步 .坑了
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
    },
    async setRole(userInfo) {
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
      const { data: res } = await this.$http.get('roles').catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      // this.$message.success('查询角色成功')
      this.rolesList = res.data
    },
    async setRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        }
      ).catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="less" scoped>

</style>