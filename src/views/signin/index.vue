<template>
  <div id="layout" class="theme-cyan">
    <div class="authentication">
      <div class="container d-flex flex-column">
        <div class="row align-items-center justify-content-center no-gutters min-vh-100">
          <div class="col-12 col-md-7 col-lg-5 col-xl-4 py-md-11">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h3 class="text-center">个性化教育内容生成平台</h3>
                <p class="text-center mb-6">标语</p>
                <form class="mb-4 mt-5">
                  <div class="input-group mb-2">
                    <input type="email" class="form-control form-control-lg" placeholder="请输入账号">
                  </div>
                  <div class="input-group mb-4">
                    <input type="password" class="form-control form-control-lg" placeholder="请输入密码">
                  </div>
                  <div class="form-group d-flex justify-content-between">
                    <label class="c_checkbox">
                      <input type="checkbox">
                      <span class="ms-2 todo_name">记住密码</span>
                      <span class="checkmark"></span>
                    </label>
                    <a class="link" href="#">忘记密码？</a>
                  </div>
                  <div class="text-center mt-5">
                    <a href="#" class="btn btn-lg btn-primary" @click="handleLogin" title="">登 录</a>
                  </div>
                </form>
                <p class="text-center mb-0">还没有账号？
                  <a class="link" href="#">注册</a>
                </p>
              </div>
            </div>
          </div>
          <div class="signin-img d-none d-lg-block text-center">
            <img src="../../assets/signin-img-cyan.svg" alt="Sign In Image">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">

import { useRouter } from 'vue-router';
const router = useRouter();


const handleLogin = async () => {

  console.log('登录');
  router.push('/chat');

}



</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>