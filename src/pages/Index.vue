<template>
    <div class="row justify-center full-height full-width text-center">
        <vue-headful :title="`${headTitle} - ${title}`"/>
        <div class="row justify-center full-height full-width text-center">
            <span :class="[titleStyle.class, `${titleStyle.class}-opacity`]">{{title}}</span>
        </div>
        <span class="subTitle">Número de pomodoros concluídos: {{numberOfPomodoros}}</span>
        <span class="info desktop-only" style="color:#13CEEB; font-size: 22px;">
        <i class="material-icons">info</i>
      <q-tooltip>
        Atalhos do teclado:<br>
        - Seta para cima: adicionar 1 ciclo de trabalho concluído<br>
        - Seta para baixo: remover 1 ciclo de trabalho concluído<br>
        - Número 5: intervalo de 5 minutos<br>
        - Control + A: easter egg =D
      </q-tooltip>
    </span>
        <div class="q-pb-sm row justify-center full-height full-width text-center">
            <q-card color="primary">
                <div id="timer">
                    <span id="minutes">{{ minutes }}</span>
                    <span id="point">:</span>
                    <span id="seconds">{{ seconds }}</span>
                </div>
            </q-card>
        </div>
        <div>
            <!-- Start timer -->
            <q-btn class="q-ma-xs"
                   icon="play_arrow"
                   round color="primary"
                   v-if="!timer"
                   @click="startTimer">
            </q-btn>

            <!-- Pause timer -->
            <q-btn class="q-ma-xs"
                   icon="pause"
                   round color="primary"
                   v-if="timer && !this.breakTime"
                   @click="stopTimer">
            </q-btn>

            <!-- Reset timer -->
            <q-btn class="q-ma-xs"
                   icon="replay"
                   round color="primary"
                   v-if="resetButton || this.breakTime === true"
                   @click="resetTimer">
            </q-btn>

            <!-- Break 5 minutes -->
            <div class="q-pt-lg row justify-center">
                <q-btn class="q-ma-xs"
                       label="Intervalo 5 min"
                       color="primary"
                       v-if="this.breakTime === false"
                       @click="breakFiveMinutes">
                </q-btn>
            </div>

            <!-- Break 15 minutes -->
            <div class="row justify-center">
                <q-btn class="q-ma-xs"
                       label="Intervalo 15 min"
                       color="primary"
                       v-if="this.breakTime === false"
                       @click="breakFifteenMinutes">
                </q-btn>
            </div>

            <!-- Add Another Pomodoro Cicle -->
            <q-btn class="q-ma-xs"
                   label="+25 minutos"
                   v-if="this.breakTime"
                   color="primary"
                   @click="resetTimerAndBeginAnotherPomodoroCicle">
            </q-btn>

            <!-- Clear Local Storage -->
            <div class="row justify-center">
                <q-btn class="q-ma-xs"
                       label="Resetar Pomodoro"
                       color="red"
                       v-if="!timer"
                       @click="resetNumberOfPomodoros">
                </q-btn>
            </div>

            <!-- Add Pomodoros Worked -->
            <div class="q-pt-lg row justify-center">
                <q-btn class="q-ma-xs"
                       label="Adicionar 1 ciclo de trabalho concluído"
                       color="faded"
                       v-if="!timer"
                       @click="addNumberOfPomodorosWorked">
                </q-btn>
            </div>

            <!-- Remove Pomodoros Worked -->
            <div class="row justify-center">
                <q-btn class="q-ma-xs"
                       label="Remover 1 ciclo de trabalho concluído"
                       color="faded"
                       v-if="!timer"
                       @click="removeNumberOfPomodorosWorked">
                </q-btn>
            </div>

            <div class="q-pb-sm row justify-center text-center">
                <q-card class="q-ma-lg" style="width: 300px">
                    <q-card-title>
                        <q-icon class="icon_alarm" slot="right" name="alarm"/>
                        Resumo Pomodoro
                    </q-card-title>
                    <q-card-separator />
                    <q-card-main class="">
                        <b>Pomodoro atual:</b> {{ +numberOfPomodoros + 1 }}º ciclo<br>
                        <span v-if="this.numberOfPomodoros === 3 || this.numberOfPomodoros === 7 || this.numberOfPomodoros === 11 || this.numberOfPomodoros === 15"><b class="interval_info">Intervalo atual: 15 minutos</b><br></span>
                        <span v-else><b class="interval_info">Intervalo atual: 5 minutos</b><br></span>
                        <br>
                        <b>Próximo pomodoro:</b> {{ +numberOfPomodoros + 2 }}º ciclo
                    </q-card-main>
                </q-card>
            </div>

            <!-- Hidden buttons for shortkey only (vue-shortkey)-->
            <button hidden v-shortkey="{up: ['arrowup']}" @shortkey="addNumberOfPomodorosWorked()"></button>
            <button hidden v-shortkey="{down: ['arrowdown']}" @shortkey="removeNumberOfPomodorosWorked()"></button>
            <button hidden v-shortkey="['5']" @shortkey="breakFiveMinutes()"></button>
            <button hidden v-shortkey="['ctrl', 'shift']" @shortkey="playAudio()"></button>
            <button hidden class="toasty" v-shortkey="['ctrl', 'a']" @shortkey="playToasty()"></button>

        </div>
    </div>
</template>

<script>
  const alarm = new Audio('./../statics/alarm.mp3')
  const audio = new Audio('./../statics/audio.mp3')
  import { Dialog } from 'quasar'
  import toasty from 'toasty'
  import './../css/Index.css'

  export default {
    name: 'PageIndex',
    watch: {
      numberOfPomodoros(newNumberOfPomodoros) {
        localStorage.numberOfPomodoros = newNumberOfPomodoros
      }
    },
    computed: {
      minutes() {
        const minutes = Math.floor(this.totalTime / 60)
        return this.padTime(minutes)
      },
      seconds() {
        const seconds = this.totalTime - (this.minutes * 60)
        return this.padTime(seconds)
      },
      headTitle() {
        return this.minutes + ':' + this.seconds
      }
    },
    data() {
      return {
        titleStyle: {'class': 'q-pt-lg q-display-2', equivalent: 'h1', color: 56, weight: 300},
        timer: null,
        totalTime: (25 * 60),
        resetButton: false,
        numberOfPomodoros: 0,
        breakTime: false,
        title: 'Clique no play e comece a trabalhar'
      }
    },
    methods: {
      startTimer() {
        this.breakTime = false
        if (this.totalTime === 0) {
          this.totalTime = (25 * 60)
        }
        this.timer = setInterval(() => this.countdown(), 1000)
        this.resetButton = true
        this.title = 'Período de trabalho'
      },
      playToasty() {
        let t = toasty();
        t.trigger();
      },
      playAudio() {
        audio.play()
      },
      addNumberOfPomodorosWorked() {
        this.numberOfPomodoros++
        this.$q.notify({
          message: 'Você completou mais um ciclo de trabalho',
          color: 'positive',
          position: 'top-right'
        })
      },
      removeNumberOfPomodorosWorked() {
        if (this.numberOfPomodoros <= 0) {
          return this.$q.notify({
            message: 'Número de pomodoros não pode ser negativo',
            color: 'negative',
            position: 'top-right'
          })
        }
        this.numberOfPomodoros--
        this.$q.notify({
          message: 'Você removeu um ciclo de trabalho',
          color: 'warning',
          position: 'top-right'
        })
      },
      resetNumberOfPomodoros() {
        this.$q.dialog({
          title: 'Aviso',
          message: 'Tem certeza que deseja resetar o pomodoro? Todas as informações atuais serão perdidas',
          ok: 'Confirmar',
          cancel: 'Cancelar'
        }).then(() => {
          this.numberOfPomodoros = 0
          this.resetPomodoro()
          this.$router.go(0)
        }).catch(() => {
        })
        // nothing
      },
      stopTimer() {
        clearInterval(this.timer)
        alarm.pause()
        this.timer = null
        this.resetButton = true
        this.title = 'O timer está pausado'
      },
      resetPomodoro() {
        alarm.pause()
        clearInterval(this.timer)
        this.timer = null
        this.resetButton = false
      },
      resetTimer() {
        alarm.pause()
        this.totalTime = (25 * 60)
        clearInterval(this.timer)
        this.timer = null
        this.resetButton = false
        this.breakTime = false
        this.title = 'O timer foi resetado'
      },
      resetTimerAndBeginAnotherPomodoroCicle() {
        alarm.pause()
        this.totalTime = (25 * 60)
        clearInterval(this.timer)
        this.timer = null
        this.title = 'Período de trabalho'
        this.timer = setInterval(() => this.countdown(), 1000)
        this.breakTime = false
        this.resetButton = true
        this.addNumberOfPomodorosWorked()
      },
      breakFiveMinutes() {
        alarm.pause()
        clearInterval(this.timer)
        this.breakTime = true
        this.totalTime = (5 * 60)
        this.timer = setInterval(() => this.countdown(), 1000)
        this.resetButton = true
        this.title = 'Intervalo 5 minutos'
      },
      breakFifteenMinutes() {
        alarm.pause()
        clearInterval(this.timer)
        this.breakTime = true
        this.totalTime = (15 * 60)
        this.timer = setInterval(() => this.countdown(), 1000)
        this.resetButton = true
        this.title = 'Intervalo 15 minutos'
      },
      padTime(time) {
        return (time < 10 ? '0' : '') + time
      },
      countdown() {
        if (this.totalTime >= 1) {
          this.totalTime--
        } else {
          this.totalTime = 0
          if (this.totalTime === 0) {
            this.play()
          }
        }
      },
      play() {
        if (alarm.paused) {
          alarm.play()
        } else {
          alarm.pause()
          alarm.currentTime = 0
        }
      }
    },
    mounted() {
      if (localStorage.numberOfPomodoros) this.numberOfPomodoros = localStorage.numberOfPomodoros
    }
  }
</script>
