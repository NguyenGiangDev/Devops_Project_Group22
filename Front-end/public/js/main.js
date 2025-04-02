// Tự động chạy khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-employee');
  
  // Thêm sự kiện xóa cho từng nút xóa
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const employeeId = event.target.dataset.id;

      // Gửi yêu cầu xóa nhân viên đến API
      const confirmDelete = confirm("Are you sure you want to delete this employee?");
      if (confirmDelete) {
        try {
          const response = await fetch(`http://localhost:3001/api/employees/${employeeId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            alert("Employee deleted successfully!");
            // Reload lại trang sau khi xóa
            window.location.reload();
          } else {
            const errorMessage = await response.text();
            alert(`Failed to delete employee: ${errorMessage}`);
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
        }
      }
    });
  });
});

// Hàm để gửi form thêm nhân viên
async function addEmployee(event) {
  event.preventDefault();

  const name = document.querySelector('#name').value;
  const position = document.querySelector('#position').value;

  try {
    const response = await fetch('http://localhost:3001/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, position })
    });

    if (response.ok) {
      alert("Employee added successfully!");
      // Redirect về trang chủ
      window.location.href = '/';
    } else {
      const errorMessage = await response.text();
      alert(`Failed to add employee: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

// Gắn hàm addEmployee với sự kiện submit của form
document.querySelector('#employee-form').addEventListener('submit', addEmployee);
