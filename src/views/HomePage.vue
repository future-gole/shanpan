<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AuthModal from '@/components/AuthModal.vue';
import { useAuthStore } from '@/stores/counter';

// 导入本地图片资源
import girlLeft from '@/assets/girl.png';
import girlRight from '@/assets/boy.png';

import sandboxVideo from '@/assets/videos/sandbox-video.mp4';
import sandboxPoster from '@/assets/sandbox.jpg'; 

// 3. 创建 ref 来引用 video 元素和追踪播放状态
const videoRef = ref(null); // 用于直接控制 video DOM 元素
const isVideoPlaying = ref(false); // 用于控制播放按钮的显示/隐藏

// 4. 创建一个播放视频的函数
function playVideo() {
  // 确保 video 元素已经加载
  if (videoRef.value) {
    videoRef.value.play();
    isVideoPlaying.value = true;
  }
}

// 标签页切换逻辑
const activeTab = ref('introduction');

function changeTab(tabID) {
  activeTab.value = tabID;
}

const route = useRoute();
const router = useRouter();

const showAuthModal = ref(false);
const authTab = ref('login');

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

function syncAuthModalFromRoute() {
  const authQuery = Array.isArray(route.query.auth) ? route.query.auth[0] : route.query.auth;
  if (authQuery === 'login' || authQuery === 'register') {
    authTab.value = authQuery;
    showAuthModal.value = true;
  } else {
    showAuthModal.value = false;
  }
}

function removeAuthQuery() {
  if (route.query.auth === undefined) return;
  const newQuery = { ...route.query };
  delete newQuery.auth;
  router.replace({ path: route.path, query: newQuery, hash: route.hash });
}

function openAuth(tab = 'login') {
  const normalized = tab === 'register' ? 'register' : 'login';
  const newQuery = { ...route.query, auth: normalized };
  router.push({ path: '/', query: newQuery });
}

function goToCalendar() {
  if (isAuthenticated.value) {
    router.push({ name: 'calendar' });
  } else {
    openAuth('login');
  }
}

watch(
  () => route.query.auth,
  () => {
    syncAuthModalFromRoute();
  }
);

watch(showAuthModal, (value) => {
  if (!value) {
    removeAuthQuery();
  }
});

watch(authTab, (value) => {
  if (!showAuthModal.value) return;
  const currentAuth = Array.isArray(route.query.auth) ? route.query.auth[0] : route.query.auth;
  if (currentAuth === value) return;
  const newQuery = { ...route.query, auth: value };
  router.replace({ path: route.path, query: newQuery, hash: route.hash });
});

onMounted(() => {
  syncAuthModalFromRoute();
});
</script>

<template>
  <div>
    <!-- 固定定位的装饰图片 -->
    <img :src="girlLeft" class="hidden lg:block fixed bottom-0 left-5 z-10 w-40 h-auto pointer-events-none">
    <img :src="girlRight" class="hidden lg:block fixed bottom-0 right-5 z-10 w-40 h-auto pointer-events-none">
    
    <!-- Hero Section -->
    <div class="hero-section pt-12 pb-24">
      <div class="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <!-- 左侧文字信息 -->
        <div>
          <h1 class="text-4xl font-extrabold mb-4 text-slate-800">坚毅能量沙盘</h1>
          <!-- <div class="flex items-center text-sm text-slate-600 mb-6">
            <span><i class="fas fa-tag mr-2"></i>超有趣的心理游戏</span>
            <span class="mx-3">|</span>
            <span><i class="far fa-clock mr-2"></i>上线时间: 2024年</span>
          </div> -->
          <div class="space-y-3 text-slate-700 bg-white bg-opacity-40 p-4 rounded-lg">
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">产品名称：</strong> 坚毅能量沙盘</p>
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">核心功能：</strong> 通过三大主题类沙盘，系统性训练并提升决心、专注与坚持三大核心品格。</p>
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">适用人群：</strong> 6-15岁中小学生，及其家长、教师。</p>
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">产品形态：</strong> 线上交互式数字沙盘（支持电脑、平板、手机）。</p>
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">核心特色：</strong> AI行为分析、个性化成长路径</p>
            <p><strong class="font-semibold text-slate-800 w-28 inline-block">互动模式：</strong> 支持个人挑战、亲子协作</p>
          </div>
          <p class="mt-6 text-slate-600 leading-relaxed">
             “坚毅能量沙盘”是一个专为中小学生设计的线上空间。在这里，你将进入“决心峡谷”、“专注密林”和“坚持高峰”三大主题关卡，通过完成有趣的搭建与解密任务，来收集你的“决心能量”、“专注能量”和“坚持能量”。每一次点击、每一次思考，都会被AI老师默默记录，为你生成专属的成长报告，并解锁更酷的挑战！
          </p>
          <div class="mt-8 flex items-center space-x-8">
            <button
              class="bg-orange-400 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-500 transition-transform hover:scale-105"
              @click="openAuth('register')"
            >
              马上开始冒险！
            </button>
            <div class="flex space-x-6 text-slate-600">
              <span class="cursor-pointer hover:text-slate-800"><i class="far fa-thumbs-up mr-2"></i>3.1k</span>
              <span class="cursor-pointer hover:text-slate-800"><i class="far fa-star mr-2"></i>2.5k</span>
              <span class="cursor-pointer hover:text-slate-800"><i class="fas fa-share-alt mr-2"></i>分享</span>
            </div>
          </div>
        </div>
            <div class="relative rounded-lg overflow-hidden shadow-2xl group bg-black">
                <video
                ref="videoRef"
                :src="sandboxVideo"
                :poster="sandboxPoster"
                class="w-full h-auto object-cover"
                playsinline
                loop
                muted
                @click="playVideo"
                >
                您的浏览器不支持 Video 标签。
                </video>
                
                <!-- 播放按钮遮罩层，当视频未播放时显示 -->
                <div
                v-if="!isVideoPlaying"
                @click="playVideo"
                class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center cursor-pointer"
                >
                    <i class="fas fa-play-circle text-white text-7xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"></i>
                </div>
<!-- 
                <p class="absolute bottom-2 right-4 text-xs text-white z-10 pointer-events-none">© 版权归 童心世界 所有</p> -->
            </div>
      </div>
    </div>

    <!-- 统计与评分卡片 -->
    <div class="container mx-auto px-6">
      <div class="stat-card flex flex-wrap justify-between items-center">
        <div class="flex items-center space-x-4 mb-4 md:mb-0">
          <div>
            <p class="text-5xl font-bold text-orange-500">5.0</p>
            <div class="text-yellow-400">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <p class="text-sm text-gray-500">1.2k+个小朋友评价</p>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 text-center">
          <div>
            <p class="text-2xl font-bold text-orange-400">98%</p>
            <p class="text-gray-500">老师推荐</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-400">95%</p>
            <p class="text-gray-500">同学都爱玩</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-400">3.5k+</p>
            <p class="text-gray-500">开心玩家</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-400">200+</p>
            <p class="text-gray-500">指导员哥哥姐姐</p>
          </div>
        </div>
        <div class="flex flex-col items-center mt-4 md:mt-0">
          <div class="pie-chart"></div>
          <p class="text-sm text-gray-500 mt-2">大家的心情分布</p>
        </div>
      </div>
    </div>

    <!-- 详细内容与标签页 -->
    <div class="container mx-auto px-6 mt-12 mb-20">
      <div class="w-full">
        <!-- 标签页导航 -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button class="tab-button" :class="{ 'active': activeTab === 'introduction' }" @click="changeTab('introduction')">寻找坚毅宝藏</button>
            <button class="tab-button" :class="{ 'active': activeTab === 'guide' }" @click="changeTab('guide')">什么是虚拟沙盘</button>
            <button class="tab-button" :class="{ 'active': activeTab === 'cases' }" @click="changeTab('cases')">其他的成长伙伴</button>
            <button class="tab-button" :class="{ 'active': activeTab === 'reviews' }" @click="changeTab('reviews')">听听大家怎么说</button>
          </nav>
        </div>
        <!-- 标签页内容 -->
        <div class="mt-8">
          <div v-show="activeTab === 'introduction'" class="content-card">
            <!-- 内容省略以保持简洁... -->
             <h3 class="text-2xl font-bold mb-4 text-gray-800">出发!寻找坚毅宝藏。</h3>
              <p class="text-gray-600 leading-loose">
                在孩子成长的旅程中,我们不仅希望他们积累知识,更期待他们建立起一种能够多支撑一生远航的
内在力量--
那就是坚毅。
这种力量,可以在共读坚毅绘本的温暖时光里悄然萌芽。通过故事中角色面临抉择时的勇气与担
当,孩子在心中种下"决心"的种子,学会在关键时刻做出不放弃的的选择
坚毅,并不只是"不放弃"那么简单。它更像是一种持久的热情与日复一日的投入相互交织的结
果。这种力量根植于一种看待自我的方式:相信能力可以成长。而坚毅盘正是锻炼这种思维的
策略场。孩子在进退之间学习专注于目标,在规则中规划路径,在不确定性中保持冷静思考,一
步步接近终点。
而坚毅,无法单靠言语教会。它需要在真实的生活中,一次次练习、一天天天积累。坚毅台历正是
为此而生,它以每日一个小任务、每周一次小挑战的方式,将"坚持"化为看得见的足迹。每翻过
一页,都是孩子对自己承诺的兑现,是毅力在时间中留下的真实刻度。
这一切的探索与练习,最终在"智毅成长"坚毅沙盘中得以整合与深化。沙盘是一个自由而受保护
              </p>
          </div>
          <div v-show="activeTab === 'guide'" class="content-card">
            <!-- 内容省略... -->
             <h3 class="text-2xl font-bold mb-4 text-gray-800">什么是虚拟沙盘</h3>
              <p class="text-gray-600 leading-loose">
心理沙盘,如同一种"心灵的语言",是一种非常有效的心理表达与成长工具。在传统的沙盘室
里,人们通过在铺满沙子的箱子中自由摆放各种微缩模具,来呈现难以用言语描述的内心世界
情绪、冲突、渴望与潜力,都会在指尖的创造中浮现。
而虚拟沙盘,正是将这一经典工具升级到了数字时代。它不是在替代实体沙盘,而是在继承其
全部精髓的基础上,开启了新的可能。研究表明,虚拟沙盘与实体沙盘在初始心理评估方面具
有同样可靠的效果。同时,它更拥有一个独特的优势:一个无限的象征空间。它打破了物理
限制,可以提供远比实体沙具更丰富、更多元的数字场景和元素,让使用者的想象力与投射能
力得以在更广阔的天地中驰骋,从而可能激发出更深层的心理内容。
坚毅能量沙盘"便是基于这一严谨原理打造的线上交互式数字沙盘。它将虚拟沙盘的无限潜
力,聚焦于"决心、专注、坚持"三大坚毅品格的培养。当孩子在"决心峡谷"、"专注密林"和
坚持高峰"中完成每一次搭建与解密时,他们不仅在游戏,更是在进行一场自我探索。Al行为
分析系统会智慧地解读这些创造过程,将孩子的选择与努力转化为对其品格发展的精准洞察,
并生成个性化成长路径。这使得虚拟沙盘不再只是一个表达工具,更是一个能够陪伴孩子、读
懂孩子,并引导其内心力量持续生长的智慧伙伴。
策略场。孩子在进退之间学习专注于目标,在规则中规划路径,在不确定性中保持冷静思考,一
步步接近终点。
而坚毅,无法单靠言语教会。它需要在真实的生活中,一次次练习、一天天天积累。坚毅台历正是
为此而生,它以每日一个小任务、每周一次小挑战的方式,将"坚持"化为看得见的足迹。每翻过
一页,都是孩子对自己承诺的兑现,是毅力在时间中留下的真实刻度。
这一切的探索与练习,最终在"智毅成长"坚毅沙盘中得以整合与深化。沙盘是一个自由而受保护
的心理空间,孩子在这里综合运用他的决心、专注与坚持,构建内心世界,面对隐喻的挑战,并
在AI的陪伴式解读下,看见自己成长的轨迹。
我们想做的,是为每个孩子装上一台隐形的心灵发动机。让给本点燃决心的火花,让棋盘磨砺专
注的锋芒,让台历见证坚持的力量,让沙盘整合成长的每一步-一推动他们不为眼前困难停留,
始终望向远方,朝着自己真正渴望的未来,稳健而明亮地前行。
              </p>
          </div>
          <div v-show="activeTab === 'cases'" class="content-card">
                           <p class="text-gray-600 leading-loose">
除了沙盘我们还有哪些成长伙伴?--当坚毅品质遇见棋盘、绘本与台历
心灵的成长需要多扇窗口。除了数字沙盘,棋盘上的策略较量、绘本中的情感共鸣、台历上
的每日足迹,让成长在游戏、阅读与实践中自然发生。
坚毅绘本:在故事中播种"决心"
故事是孩子理解世界的第一扇窗。"坚毅绘本"通过贴近心灵的叙事,展现角色在关键时刻如
何做出勇敢的选择。孩子在共读中与主人公一同经历犹豫、权衡与决断,潜移默化中理解什
么是"决心",并学会在现实生活的岔路口,为自己选择那条不易但正确的路。
坚毅棋盘:在对弈中磨砺"专注"
棋盘是规则与策略的微型战场。"坚毅棋盘"将抽象的"专注"能力转化为具体的游戏机制。玩
家必须排除干扰,紧盯目标,计算步骤,在每一次进退中规划路径。它让孩子亲身体验到:
真正的胜利,属于那些能沉下心来、冷静思考、全程投入的人。
坚毅台历:在每日坚持中积累"毅力
毅力的本质,是时间中的重复与坚守。"坚毅台历"以日为单元,通过一个个小任务、小挑
战,将"坚持"化为可见的行动。每完成一天,就亲手标记一份成就。它让孩子直观地感受
到,伟大的目标是由无数个"今天"的坚持铺就的,从而培养起最扎实的耐性与韧性。
              </p>
          </div>
          <div v-show="activeTab === 'reviews'" class="content-card">
<!-- 评价卡片 1 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-user-circle"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">豆豆妈妈</p>
            <p class="text-sm text-slate-500">孩子9岁</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "开学三个月,老师特意打电话表扬孩子上课专注力明显提升!回想起来,每天15钟的坚毅棋盘时间,让孩子学会了落子无悔的专注态度。"
        </blockquote>
      </div>

      <!-- 评价卡片 2 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-book-open"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">航航的成长日记</p>
            <p class="text-sm text-slate-500">11岁</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "这学期数学进步了20分!但最让我骄傲的是坚持用坚毅台历100天了!每次想偷懒时,看到已经坚持了这么多天,就告诉自己不能半途而废。"
        </blockquote>
      </div>

      <!-- 评价卡片 3 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-star"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">星辰大海</p>
            <p class="text-sm text-slate-500">15岁</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "中考压力大的时候,坚毅沙盘成了我的树洞。在沙盘里建造自己的理想校园,让我重新找到了努力的意义。感谢陪我度过最难时光的AI导师!"
        </blockquote>
      </div>

      <!-- 评价卡片 4 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-user-friends"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">睿睿爸爸</p>
            <p class="text-sm text-slate-500">孩子13岁</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "最意外的是,坚毅绘本居然让叛逆期的儿子主动找我聊天。他说故事里的主人公很像他,我们第一次像朋友一样讨论了'什么是真正的勇敢'。"
        </blockquote>
      </div>
      
      <!-- 评价卡片 5 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-sun"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">小向日葵</p>
            <p class="text-sm text-slate-500">10岁</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "我给每本坚毅绘本都画了续集!最喜欢【勇敢的小种子》,我把自己的故事也画了进去。妈妈说我讲故事时的眼神都在发光!"
        </blockquote>
      </div>

      <!-- 评价卡片 6 -->
      <div class="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-orange-100 text-orange-500 rounded-full h-12 w-12 flex items-center justify-center mr-4">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div>
            <p class="font-bold text-slate-900">乐乐老师</p>
            <p class="text-sm text-slate-500">任教12年</p>
          </div>
        </div>
        <blockquote class="text-slate-600 leading-relaxed italic">
          "在班级里引入坚毅棋盘后,最明显的变化是孩子们面对挫折的态度。现在考试失利时,他们会说'老师,这只是我游戏里的一个关卡而已'。"
        </blockquote>
      </div>
          </div>
        </div>
      </div>
    </div>
    <AuthModal
      :show="showAuthModal"
      :tab="authTab"
      @update:show="(value) => (showAuthModal = value)"
      @update:tab="(value) => (authTab = value)"
    />
  </div>
</template>

<style>
/* 将原始HTML的样式放在这里，它们将应用于这个组件 */
.hero-section {
  background: linear-gradient(135deg, #fef08a 0%, #ffc0cb 100%);
}
.stat-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 2rem;
  margin-top: -60px;
  position: relative;
  z-index: 10;
}
.tab-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}
.tab-button.active, .tab-button:hover {
  color: #fb923c;
  border-bottom-color: #fb923c;
}
.content-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 2rem;
}
.pie-chart {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-image: conic-gradient(
      #facc15 0% 55%,
      #fb923c 55% 80%,
      #a78bfa 80% 95%,
      #e5e7eb 95% 100%
  );
}
</style>