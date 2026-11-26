import urllib.request
import json
import subprocess
import time

import os

def run_e2e():
    sub_env = dict(os.environ)
    sub_env['PYTHONPATH'] = 'Aashray'
    sub_env['DISABLE_SQLALCHEMY_CEXT'] = '1'
    proc = subprocess.Popen(
        ['.\\venv\\Scripts\\python.exe', '-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000'],
        env=sub_env
    )

    try:
        time.sleep(3)
        
        # 1. Health check
        req = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
        health = json.loads(req.read().decode('utf-8'))
        print('1. Health check:', health)
        assert health['database'] == 'MySQL'
        assert health['db_status'] == 'connected'

        # 2. Get climates from MySQL
        clim_req = urllib.request.urlopen('http://127.0.0.1:8000/api/climates')
        climates = json.loads(clim_req.read().decode('utf-8'))
        ids = [c['id'] for c in climates]
        print(f'2. Climates from MySQL: {len(climates)} items -> {ids}')
        assert len(climates) >= 5

        # 3. Get materials from MySQL
        mat_req = urllib.request.urlopen('http://127.0.0.1:8000/api/materials')
        materials = json.loads(mat_req.read().decode('utf-8'))
        print(f'3. Materials from MySQL: walls={len(materials["wall_materials"])}, roofs={len(materials["roof_materials"])}, insul={len(materials["insulation_materials"])}, glazing={len(materials["glazing_types"])}')
        assert len(materials['wall_materials']) >= 4

        # 4. Default shelter
        def_req = urllib.request.urlopen('http://127.0.0.1:8000/api/default-shelter')
        default_shelter = json.loads(def_req.read().decode('utf-8'))
        print('4. Default shelter from MySQL:', default_shelter['id'], default_shelter['name'])
        assert default_shelter['id'] == 'ladakh_winter_shelter_01'

        # 5. Full RESTful CRUD on Shelters in MySQL
        # 5a. INSERT (POST)
        new_shelter = {
            'id': 'api_crud_shelter_101',
            'name': 'API Test Shelter',
            'location_id': 'ladakh',
            'shelter_type': 'Field Station',
            'length_m': 4.5,
            'width_m': 3.5,
            'height_m': 2.8,
            'orientation_deg': 180.0,
            'wall_material_id': 'adobe_mud',
            'roof_material_id': 'mud_straw_timber',
            'insulation_id': 'straw_woodwool',
            'window_count': 2,
            'window_width_m': 1.0,
            'window_height_m': 1.0,
            'glazing_id': 'double_clear'
        }
        post_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/shelters',
            data=json.dumps(new_shelter).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res_post = json.loads(urllib.request.urlopen(post_req).read().decode('utf-8'))
        print('5a. CRUD INSERT (POST /api/shelters):', res_post['id'])
        assert res_post['id'] == 'api_crud_shelter_101'

        # 5b. SELECT (GET all & GET single)
        all_s = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/shelters').read().decode('utf-8'))
        single_s = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/shelters/api_crud_shelter_101').read().decode('utf-8'))
        print(f'5b. CRUD SELECT: total shelters in MySQL={len(all_s)}, single={single_s["id"]}')
        assert any(s['id'] == 'api_crud_shelter_101' for s in all_s)
        assert single_s['name'] == 'API Test Shelter'

        # 5c. UPDATE (PUT)
        put_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/shelters/api_crud_shelter_101',
            data=json.dumps({'name': 'Updated API Test Shelter', 'length_m': 5.5}).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        res_put = json.loads(urllib.request.urlopen(put_req).read().decode('utf-8'))
        print('5c. CRUD UPDATE (PUT /api/shelters/{id}): new length =', res_put['length_m'])
        assert res_put['length_m'] == 5.5

        # 5d. PARTIAL UPDATE (PATCH)
        patch_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/shelters/api_crud_shelter_101',
            data=json.dumps({'width_m': 4.2}).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PATCH'
        )
        res_patch = json.loads(urllib.request.urlopen(patch_req).read().decode('utf-8'))
        print('5d. CRUD PATCH (/api/shelters/{id}): new width =', res_patch['width_m'])
        assert res_patch['width_m'] == 4.2

        # 5e. DELETE (DELETE)
        del_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/shelters/api_crud_shelter_101',
            method='DELETE'
        )
        res_del = json.loads(urllib.request.urlopen(del_req).read().decode('utf-8'))
        print('5e. CRUD DELETE (DELETE /api/shelters/{id}):', res_del)
        assert res_del['status'] == 'deleted'

        # 6. User CRUD in MySQL (POST, GET, PUT, PATCH, DELETE)
        user_post = urllib.request.Request(
            'http://127.0.0.1:8000/api/users',
            data=json.dumps({'id': 'u_test_101', 'email': 'user101@aashray.in', 'name': 'Architect Roy', 'role': 'designer'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res_upost = json.loads(urllib.request.urlopen(user_post).read().decode('utf-8'))
        print('6a. User POST:', res_upost['id'])
        assert res_upost['id'] == 'u_test_101'

        res_uget = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/users/u_test_101').read().decode('utf-8'))
        print('6b. User GET:', res_uget['name'])
        assert res_uget['name'] == 'Architect Roy'

        user_patch = urllib.request.Request(
            'http://127.0.0.1:8000/api/users/u_test_101',
            data=json.dumps({'name': 'Senior Architect Roy'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PATCH'
        )
        res_upatch = json.loads(urllib.request.urlopen(user_patch).read().decode('utf-8'))
        print('6c. User PATCH:', res_upatch['name'])
        assert res_upatch['name'] == 'Senior Architect Roy'

        user_del = urllib.request.Request('http://127.0.0.1:8000/api/users/u_test_101', method='DELETE')
        res_udel = json.loads(urllib.request.urlopen(user_del).read().decode('utf-8'))
        print('6d. User DELETE:', res_udel)
        assert res_udel['status'] == 'deleted'

        # 7. Simulate endpoint (persisting simulation to MySQL)
        sim_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/simulate',
            data=json.dumps({'design': default_shelter}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        sim_res = json.loads(urllib.request.urlopen(sim_req).read().decode('utf-8'))
        print(f'6. /api/simulate: 2 AM temp={sim_res["temp_at_2am"]}°C, total loss={sim_res["total_heat_loss_kwh"]} kWh')
        assert sim_res['mean_indoor_temp'] is not None

        # 7. Recommendation endpoint
        rec_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/recommend',
            data=json.dumps(default_shelter).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        rec_res = json.loads(urllib.request.urlopen(rec_req).read().decode('utf-8'))
        print(f'7. /api/recommend: delta 2 AM={rec_res["metrics"][0]["difference"]}°C')
        assert len(rec_res['metrics']) > 0

        # 8. Report endpoint
        rep_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/report',
            data=json.dumps(default_shelter).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        rep_res = json.loads(urllib.request.urlopen(rep_req).read().decode('utf-8'))
        print('8. /api/report: Title =', rep_res['title'])
        assert 'AASHRAY' in rep_res['title']

        # 9. Matplotlib Graph endpoint (POST and GET)
        post_g = urllib.request.Request(
            'http://127.0.0.1:8000/api/graph/temperature',
            data=json.dumps({'hourly_data': sim_res['hourly_data']}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        img_post = urllib.request.urlopen(post_g).read()
        assert img_post.startswith(b'\x89PNG\r\n\x1a\n')

        img_get = urllib.request.urlopen('http://127.0.0.1:8000/api/graph/temperature').read()
        assert img_get.startswith(b'\x89PNG\r\n\x1a\n')
        print(f'9. Matplotlib PNG Graph endpoints verified: PNG sizes = {len(img_post)}, {len(img_get)}')

        # 10. Floor Plan OpenCV Automatic Dimension Detection & Calibration in MySQL
        import cv2
        import numpy as np

        # Create synthetic architectural floor plan
        synth = np.ones((600, 800, 3), dtype=np.uint8) * 255
        cv2.rectangle(synth, (150, 100), (650, 480), (30, 30, 30), 8)
        cv2.line(synth, (400, 100), (400, 480), (30, 30, 30), 4)
        _, buf = cv2.imencode(".png", synth)
        img_bytes = buf.tobytes()

        # Build multipart/form-data
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        body = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="file"; filename="sample_floorplan.png"\r\n'
            f'Content-Type: image/png\r\n\r\n'
        ).encode('utf-8') + img_bytes + (
            f'\r\n--{boundary}\r\n'
            f'Content-Disposition: form-data; name="reference_length_m"\r\n\r\n'
            f'7.5\r\n'
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="ceiling_height_m"\r\n\r\n'
            f'2.9\r\n'
            f'--{boundary}--\r\n'
        ).encode('utf-8')

        fp_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/floorplan/analyze',
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
        )
        fp_res = json.loads(urllib.request.urlopen(fp_req).read().decode('utf-8'))
        print(f'10a. Floorplan Analysis OpenCV: has_dims={fp_res["has_dimensions"]}, length={fp_res["length_m"]}m, width={fp_res["width_m"]}m, id={fp_res["floorplan_id"]}')
        assert fp_res['has_dimensions'] is True
        assert fp_res['length_m'] == 7.5
        assert fp_res['floorplan_id'] is not None

        # 10b. Save User-Corrected Measurements to MySQL
        save_req = urllib.request.Request(
            'http://127.0.0.1:8000/api/floorplan/save-measurements',
            data=json.dumps({
                'floorplan_id': fp_res['floorplan_id'],
                'user_corrected_length_m': 8.0,
                'user_corrected_width_m': 6.0,
                'ceiling_height_m': 3.0
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        save_res = json.loads(urllib.request.urlopen(save_req).read().decode('utf-8'))
        print(f'10b. Floorplan Measurements Saved in MySQL: {save_res["status"]}, user_L={save_res["user_corrected_length_m"]}')
        assert save_res['status'] == 'saved'

        # 10c. Retrieve from MySQL
        get_fp = json.loads(urllib.request.urlopen(f'http://127.0.0.1:8000/api/floorplans/{fp_res["floorplan_id"]}').read().decode('utf-8'))
        print(f'10c. Retrieved Floorplan from MySQL: id={get_fp["id"]}, user_L={get_fp["user_corrected_length_m"]}, user_H={get_fp["ceiling_height_m"]}')
        assert get_fp['user_corrected_length_m'] == 8.0
        assert get_fp['ceiling_height_m'] == 3.0

        print('\nALL END-TO-END FASTAPI & MYSQL VERIFICATIONS SUCCEEDED 100%!')
    finally:
        proc.terminate()
        proc.wait()

if __name__ == '__main__':
    run_e2e()
