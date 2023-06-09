<template>
  <div class="q-my-none vertical-top full-height" style="width: 100%">
    <q-list separator dense class="book fit vertical-top" v-if="!loading">
      <q-item class="justify-end" v-if="!book.empty">
        <q-item-section class="col-5">
          <q-input
            outlined
            :label="$t('book.balance')"
            v-model="balance"
            dense
            readonly
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item v-for="line in book.book" :key="line.id">
        <q-item-section avatar top class="col-1 gt-sm">
          <q-item-label caption
            ><small class="text-grey-8">{{
              $filters.dateOrTime(line.created_at)
            }}</small>
          </q-item-label>
          <q-icon :name="lineIcon(line)" :color="lineColor(line)" />
        </q-item-section>
        <q-item-section
          top
          class="col-xs-6 col-sm-6 col-md-7 col-lg-7 col-xl-7"
        >
          <q-item-label lines="1">
            <span class="text-weight-regular">
              <q-icon
                :name="lineChannel(line).icon"
                :color="lineColor(line)"
                size="xs"
              />
              {{ lineChannel(line).label }}
            </span>
          </q-item-label>
          <q-item-label caption lines="1">
            <small class="text-grey-8 lt-md">{{
              $filters.dateOrTime(line.created_at)
            }}</small>
            {{ line.description }}
          </q-item-label>
        </q-item-section>
        <q-item-section
          side
          class="col-xs-3 col-sm-3 col-md-2 col-lg-2 col-xl-2"
        >
          <q-item-label caption>{{ $t("book.amount") }}</q-item-label>
          <q-item-label lines="1">
            <span :class="['text-weight-regular', 'text-' + lineColor(line)]">
              {{ $filters.money(line.amount) }}
            </span>
          </q-item-label>
        </q-item-section>
        <q-item-section
          side
          class="col-xs-3 col-sm-3 col-md-2 col-lg-2 col-xl-2"
        >
          <q-item-label caption>{{ $t("book.balance") }}</q-item-label>
          <q-item-label lines="1">
            <span
              :class="[
                'text-weight-regular',
                parseInt(line.balance.balance) > 0
                  ? 'text-positive'
                  : 'text-negative'
              ]"
            >
              {{ $filters.money(line.balance.balance) }}
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="book.pagination.lastPage" class="justify-center">
        <q-item-section
          avatar
          class="col-1"
          v-if="book.book.length > book.pagination.minPerPage"
        >
          <q-icon color="primary" name="hiking" />
        </q-item-section>
        <q-item-section
          class="col-6 text-primary text-center q-mt-md"
          v-if="book.book.length > book.pagination.minPerPage"
        >
          {{ $t("book.endOfTheRecords") }}
        </q-item-section>
      </q-item>
      <q-item v-else-if="!book.empty" class="justify-center">
        <q-item-section class="col-6">
          <q-btn
            flat
            color="primary"
            icon="expand_more"
            @click="book.nextPage()"
            :loading="loading"
          />
        </q-item-section>
      </q-item>
      <q-item v-else class="justify-center">
        <q-card class="col-xs-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 q-ma-md">
          <q-img src="~assets/empty-list.jpg" :ratio="20 / 9" fit="cover">
            <div class="absolute-bottom text-center">
              <div class="text-h6">
                <q-icon size="md" name="pending" />
                {{ $t("book.noRecords") }}
              </div>
              <div class="text-subtitle2">{{ $t("book.addFirstRecord") }}</div>
              <q-separator spaced inset dark />
              <div class="full-width"><Actions :sticky="false" /></div>
            </div>
          </q-img>
        </q-card>
      </q-item>
      <Actions />
    </q-list>
    <q-list v-else separator dense class="col-xl-8 bg-white rounded-borders">
      <q-item>
        <q-item-section>
          <q-linear-progress indeterminate />
        </q-item-section>
      </q-item>
      <q-item v-for="line in book.linesPerPage" :key="line">
        <q-item-section>
          <q-linear-progress indeterminate />
        </q-item-section>
        <q-item-section top class="col-6">
          <q-item-label lines="1">
            <span class="text-weight-regular">
              <q-skeleton type="QRadio" /> <q-skeleton type="rect" />
            </span>
          </q-item-label>
        </q-item-section>
        <q-item-section side class="col-3">
          <q-skeleton type="QBadge" />
        </q-item-section>
        <q-item-section side class="col-3">
          <q-skeleton type="QBadge" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { ref } from "vue";
import { bookStore } from "stores/book/";
import Actions from "components/Book/Actions.vue";

export default {
  name: "cash-flow-list",
  components: {
    Actions
  },
  setup() {
    const book = bookStore();
    const loading = ref(false);
    return {
      loading,
      book
    };
  },
  methods: {
    async fetchPage() {
      this.loading = true;
      await this.book.fetchPage();
      this.loading = false;
    },
    lineIcon(line) {
      if (line.type === "credit") {
        return "add";
      }
      return "remove";
    },
    lineColor(line) {
      if (line.type === "credit" || line.balance.balance > 0) {
        return "positive";
      }
      return "negative";
    },
    lineChannel(line) {
      return this.book?.availableGateways?.find(
        (channel) => channel.value === line.channel
      );
    }
  },
  computed: {
    balance() {
      return this.$filters.money(this.book.balance.balance);
    }
  },
  mounted() {
    this.fetchPage();
  }
};
</script>
