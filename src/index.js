import Vue from 'vue'
import VuePanZoom from '@/plugins/vue-svg-pan-zoom'
import VuePicking from '@/plugins/vue-picking'
import '@/stylesheets/sdk'
import promise from 'es6-promise'
import axios from 'axios'
// Polyfill of ES6 for IE
import './polyfill'
// To add to window
if (!window.Promise) {
  window.Promise = promise
}

Vue.prototype.$http = axios

Vue.use(VuePanZoom)
Vue.use(VuePicking)

/**
 * SDK ManagerMap Class
 */
class ManagerMap {
  constructor (options) {
    // const componentNames = ['management', 'user-booking']
    axios.defaults.baseURL = options.endPoint
    if (!options.el && !/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g.test(options.el)) {
      throw new Error('el attribute has no setting')
    }

    const app = require(`@/components/management`)
    const vframe = require(`@/components/vframe`)

    axios.post('/users/token', {
      access_key: options.accessKey,
      secret: options.secret
    })
    .then(res => {
      localStorage.setItem('_x_t', res.data.token)
      return res.data.token
    })
    .then(token => {
      // Vue instance
      return new Vue({
        el: options.el,
        data: {
          fields: []
        },
        methods: {
          generateFormFields (data) {
            this.fields = data
          },
          onAfterSave (data) {
            if (options.onAfterSave instanceof Function) {
              options.onAfterSave(data)
            }
          }
        },

        render (createElement) {
          // NOTICE: This is for production (embedded components in iframe)
          return createElement('div', {
            style: {
              height: '100%'
            }
          }, [
            this.fields.map(function (field) {
              /**
               * field should has properties:
               * * type
               * * row
               * * column
               * * _id
               * * node_id
               * * label
               */
              return createElement('input', {
                attrs: {
                  value: field.node_id,
                  id: field._id,
                  type: 'hidden',
                  name: 'xeats[]',
                  'data-type': field.type,
                  'data-row': field.row,
                  'data-column': field.column,
                  'data-label': field.label
                }
              })
            }),
            createElement('vframe', {
              props: {
                width: options.width,
                height: options.height
              }
            }, [
              createElement('app', {
                props: {
                  width: options.width,
                  height: options.height,
                  seatsKey: options.seatsKey,
                  zoomMax: options.zoomMax,
                  zoomMin: options.zoomMin,
                  amountMax: options.amountMax,
                  amountMin: options.amountMin,
                  categories: options.categories,
                  disableWheel: options.disableWheel,
                  info: options.info,
                  /**
                   * When use vframe
                   * Please make sure your component need to place data
                   * outside of iframe for form-post.
                   */
                  generateFormFields: this.generateFormFields,
                  onAfterSave: this.onAfterSave
                }
              })
            ])
          ])

          /**
           * Wrap in iframe will cause console has nothing.
           * The snippet as follow provide for dev.
           */
          // NOTICE: This is for development
          // return createElement('app', {
          //   props: {
          //     width: options.width,
          //     height: options.height,
          //     seatsKey: options.seatsKey,
          //     zoomMax: options.zoomMax,
          //     zoomMin: options.zoomMin,
          //     amountMax: options.amountMax,
          //     amountMin: options.amountMin,
          //     disableWheel: options.disableWheel,
          //     categories: options.categories,
          //     info: options.info,
          //     onAfterSave: this.onAfterSave
          //   }
          // })
          /* /development */
        },
        components: {
          app,
          vframe
        }
      })
    })
    .catch(err => {
      console.error(err)
    })
  }
}

class UserMap {
  constructor (options) {
    axios.defaults.baseURL = options.endPoint
    if (!options.el && !/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g.test(options.el)) {
      throw new Error('el attribute has no setting')
    }

    const app = require(`@/components/user-booking`)
    const vframe = require(`@/components/vframe`)
    return new Vue({
      el: options.el,
      data: {
        fields: []
      },
      methods: {
        generateFormFields (data) {
          if (options.onPick instanceof Function) {
            options.onPick(data)
          } else {
            this.fields = data
          }
        }
      },
      render (createElement) {
        // NOTICE: This is for production (embedded components in iframe)
        return createElement('div', {
          style: {
            height: '100%'
          }
        }, [
          this.fields.map(function (field) {
            /**
             * field should has properties:
             * * type
             * * row
             * * column
             * * _id
             * * node_id
             * * label
             */
            return createElement('input', {
              attrs: {
                value: field.node_id,
                id: field._id,
                type: 'hidden',
                name: 'xeats[]',
                'data-type': field.type,
                'data-row': field.row,
                'data-column': field.column,
                'data-label': field.label
              }
            })
          }),
          createElement('vframe', {
            props: {
              width: options.width,
              height: options.height
            }
          }, [
            createElement('app', {
              props: {
                width: options.width,
                height: options.height,
                seatsKey: options.seatsKey,
                accessKey: options.accessKey,
                disableWheel: options.disableWheel,
                zoomMax: options.zoomMax,
                zoomMin: options.zoomMin,
                amountMax: options.amountMax,
                amountMin: options.amountMin,
                readOnly: options.readOnly,
                /**
                 * For limiting the booking time for each seat category
                 */
                limitCategory: options.limitCategory,
                /**
                 * disable the time limit of limitCategory (this is for preoccupying seats)
                 */
                disableDatetimeLimit: options.disableDatetimeLimit,
                /**
                 * When use vframe
                 * Please make sure your component need to place data
                 * outside of iframe for form-post.
                 */
                generateFormFields: this.generateFormFields
              }
            })
          ])
        ]) /* /production */

        // NOTICE: This is for development
        // return createElement('app', {
        //   props: {
        //     width: options.width,
        //     height: options.height,
        //     seatsKey: options.seatsKey,
        //     accessKey: options.accessKey,
        //     zoomMax: options.zoomMax,
        //     zoomMin: options.zoomMin,
        //     amountMax: options.amountMax,
        //     amountMin: options.amountMin,
        //     readOnly: options.readOnly,
        //     limitCategory: options.limitCategory,
        //     disableDatetimeLimit: options.disableDatetimeLimit,
        //     disableWheel: options.disableWheel,
        //     generateFormFields: this.generateFormFields
        //   }
        // })
        /* /develope */
      },
      components: {
        app,
        vframe
      }
    })
  }
}

export default { ManagerMap, UserMap }
export { ManagerMap, UserMap }
