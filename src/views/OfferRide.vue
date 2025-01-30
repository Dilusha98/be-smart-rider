<script setup>
import { ref ,computed} from 'vue';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-dt';
import DataTablesResponsive from 'datatables.net-responsive-dt';
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

DataTable.use(DataTablesCore);
DataTable.use(DataTablesResponsive);

const makeOfferImg = ref(new URL('/assets/img/user-side/makeOffer.png', import.meta.url).href);
const createRideImg = ref(new URL('/assets/img/user-side/createRide.png', import.meta.url).href);

const filters = ref({ date: '', from: '', to: '' });
const rides = ref([
    { id: 1, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-28', from: 'New York', to: 'Boston' },
    { id: 2, vehicleNumber: 'KQ-9852', userPic: '', date: '2025-01-29', from: 'San Francisco', to: 'Los Angeles' },
    { id: 3, vehicleNumber: 'CAB-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 4, vehicleNumber: 'CAR-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 5, vehicleNumber: 'HG-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 6, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 7, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 8, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 9, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 10, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 11, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
    { id: 12, vehicleNumber: 'KI-9852', userPic: '', date: '2025-01-30', from: 'Chicago', to: 'Houston' },
]);

const filteredRides = computed(() => {
    return rides.value.filter(ride =>
        (!filters.value.date || ride.date === filters.value.date) &&
        (!filters.value.from || ride.from.toLowerCase().includes(filters.value.from.toLowerCase())) &&
        (!filters.value.to || ride.to.toLowerCase().includes(filters.value.to.toLowerCase()))
    );
});

const tableData = computed(() => filteredRides.value.map(ride => ({
    vehical: `<div class='flex items-center gap-2'><img src='${ride.userPic || './assets/img/user-side/car.png'}' alt='User' style="width:25px;" class='w-8 h-8 rounded-full' /><br> ${ride.vehicleNumber}</div>`,
    date: ride.date,
    from: ride.from,
    to: ride.to,
    actions: `<a><i class='fa fa-eye'></i></a>`,
    test: `<a><i class='fa fa-eye'></i></a>`
}))); 

const columns = ref([
    { title: 'Vehical', data: 'vehical' },
    { title: 'Date', data: 'date' },
    { title: 'From', data: 'from' },
    { title: 'To', data: 'to' },
    { title: '', data: 'actions', orderable: false },
]);
</script>

<template>
    <div>

        <div class="d-flex flex-wrap justify-content-between gap-3 pt-4">

            <a href="" class="text-decoration-none flex-fill clickable-card">
                <div class="card d-flex flex-row align-items-center p-2 shadow-sm">
                    <img :src="makeOfferImg" class="" alt="Make Offer" style="width: 50px; height: 50px;">
                    <div class="card-body p-0">
                        <h6 class="mb-0 text-dark">Make Offer</h6>
                    </div>
                </div>
            </a>

            <a href="" class="text-decoration-none flex-fill clickable-card">
                <div class="card d-flex flex-row align-items-center p-2 shadow-sm">
                    <img :src="createRideImg" class="" alt="Create Ride" style="width: 50px; height: 50px;">
                    <div class="card-body p-0">
                        <h6 class="mb-0 text-dark">Create Ride</h6>
                    </div>
                </div>
            </a>
        </div>

        <div class="row p-1">
            <DataTable 
            :options="{
            responsive: true,
            paging: true,
            pageLength: 5, 
            lengthChange:false,
            searching: false,
            ordering: true,
            info: true,
            responsive: true,
            }" 
            :data="tableData" 
            :columns="columns"
        />
        </div>
    </div>
  </template>

<style scoped>
    @import 'node_modules/datatables.net-dt/css/dataTables.dataTables.css';
    @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';

    .clickable-card {
        transition: transform 0.2s, box-shadow 0.2s;
        border: none;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
        margin:10px;
    }

    .clickable-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .card-img-left {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 15px;
    }

    .card-body h6 {
        margin-bottom: 0;
        font-weight: 700;
        font-size: 16px;
    }

</style>
