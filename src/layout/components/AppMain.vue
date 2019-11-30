<template>
  <section class="app-main">
    <!-- 过渡动画注释 by zxh -->
    <!-- <transition name="fade-transform" mode="out-in"> -->
    <transition>
      <!-- <keep-alive> -->
      <router-tab :tabs="tabs" />
      <!-- </keep-alive> -->
    </transition>
  </section>
</template>

<script>
import path from 'path'

export default {
  name: 'AppMain',
  data() {
    return {
      tabs: []
    }
  },
  computed: {
    routes() {
      return this.$store.state.permission.routes
    }
  },
  created() {
    this.initTabs()
  },
  methods: {
    // 初始页签数据
    initTabs() {
      // 固定标签
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      affixTags.forEach(tag => {
        const item = {
          closable: false,
          icon: tag.meta.icon,
          id: tag.path,
          title: tag.meta.title,
          to: tag.fullPath,
          affix: tag.meta.affix
        }
        this.tabs.push(item)
      })
    },
    /**
     * 获取需要固定的标签
     */
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header+.app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header+.app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
<style scoped>
  @import '//at.alicdn.com/t/font_1423566_igs45ugc2o.css';
</style>
