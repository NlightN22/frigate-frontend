import axios from "axios";
import { baseUrl } from "../api/baseUrl";
import useSWR from 'swr';
import Select from '../components/Select';
import Switch from '../components/Switch';
import { useEffect, useState } from 'preact/hooks';


export default function AccessList() {
    const [selected, setSelected] = useState('')
    const [roleNames, setRoleNames] = useState()
    const [roleId, setRoleId] = useState()

    const fetcher = (path, params) => {
        const client = axios.create({ baseURL: `${baseUrl}`, withCredentials: true})
        return client.get(path, { params }).then((res) => res.data)
    }

    const { data: fetchedRoles } = useSWR('acl/roles', fetcher);

    useEffect(() => {
        if (fetchedRoles) {
            const roles = fetchedRoles.map(role => {
                return {
                    value: role.authId,
                    label: role.name
                }
            })
            setRoleNames(roles)
        }
    }, [fetchedRoles])

    const handleSelect = (value) => {
        const role_id = value.undefined
        setRoleId(role_id)
        setSelected(role_id)
    }

    return (
        <div className="p-2 px-4">
            <div className="flex space-x-4 mb-4 max-w-4xl">
                Access List
            </div>
            <div className="flex space-x-4 mb-4 max-w-4xl">
                <Select label="Select role" options={roleNames} selected={selected} onChange={handleSelect} />
            </div>
            {roleId ?
                <CameraItem role_id={roleId} />
                :
                < div />
            }
        </div>
    )
}

function CameraItem(role_id) {
    role_id = role_id.role_id

    const [cameras, setCameras] = useState()
    const client = axios.create({ baseURL: `${baseUrl}acl/` })

    const fetcher = (path, params) => {
        return client.get(path, { params }).then((res) => res.data)
    }

    const {data: fetchedCameras, mutate} = useSWR("cameras", fetcher)

    const handleSwitch = async (id, checked) => {
            const operation = checked ? "add" : "delete"
            const req = {
                cameraId: id,
                accessRoleId: role_id,
                operation: operation
            }

            const response = await client.put(`cameras`, req)

            if (response.status === 200) {
                mutate()
            }
        }

    useEffect(() => {
        console.log("rendered")
    })

    useEffect(() => {
        if (fetchedCameras) {
            const checkedCameras = fetchedCameras.map(camera => ({ ...camera, checked: camera.accessRoles.includes(role_id) }))
            setCameras(checkedCameras)
        }
    }, [fetchedCameras, role_id])

    return (
        <div className="flex-col space-y-4 max-w-4xl ">
            {
                cameras ?
                    cameras.map(camera => {
                        return <Switch checked={camera.checked} id={camera._id} label={camera.name} labelPosition="before" onChange={handleSwitch} />
                    })
                    : <div />
            }
        </div>
    )
}