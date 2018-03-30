<template>
  <i>
    <svg class="icon" aria-hidden="true" :style="styles">
      <use v-bind:xlink:href="classes"></use>
    </svg>
  </i>
</template>
<script>
    const prefixCls = 'icon';

    export default {
        name: 'Icon',
        props: {
            type: String,
            size: [Number, String],
            color: String
        },
        computed: {
            classes () {
                return `#${prefixCls}-${this.type}`;
            },
            styles () {
                let style = {};

                if (this.size) {
                    style['font-size'] = `${this.size}px`;
                }

                if (this.color) {
                    style.color = this.color;
                }

                return style;
            }
        }
    };
</script>

<style lang="less" scoped>
  // i {
  //   display: inline-block;
  //   line-height: 1em;
  // }
  .icon {
    width: 1em;
    height: 1em;
    vertical-align: middle;
    fill: currentColor;
    overflow: hidden;
  }
</style>
